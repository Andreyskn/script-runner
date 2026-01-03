import type { FileId } from '@server/files';
import type { ExecEndData, ExecId, ExecStartData } from '@server/runner';

import { api, ws } from '@/api';
import { ComponentStore, getFilename } from '@/utils';

import { filesStore } from '../Scripts/stores/filesStore';
import type { OutputLine } from '../Scripts/stores/scriptStore';

export type ActiveEntry = {
	active: true;
	name: string;
	path: string;
	startedAt: Date;
	fileId: FileId;
	execId: ExecId;
	textVersion: number;
};

export type ArchivedEntry = Replace<ActiveEntry, { active: false }> & {
	exitCode: number;
	hasOutput: boolean;
	output: OutputLine[] | null;
	endedAt: Date;
	duration: number;
};

type CombinedEntry = Combine<ActiveEntry | ArchivedEntry>;

export type ArchiveStoreEntry = Entry<CombinedEntry>;

type StorageKey = 'lastSeenEndedAt';

type State = {
	active: Map<ExecId, Entry<ActiveEntry>>;
	archived: Map<ExecId, Entry<ArchivedEntry>>;
	unseenCount: number;
};

/** Minimal execution time for a script to be placed on the active list  */
const ACTIVE_STATUS_DELAY = 1000;

class ArchiveStore extends ComponentStore<State> {
	state: State = {
		active: new Map(),
		archived: new Map(),
		unseenCount: 0,
	};

	storage = {
		get: (key: StorageKey) => {
			return localStorage.getItem(key);
		},
		set: (key: StorageKey, value: string) => {
			localStorage.setItem(key, value);
		},
	};

	constructor() {
		super();

		Promise.all([
			api.getActiveScripts().then((result) => {
				if (!result.ok) {
					return;
				}

				result.value.forEach(this.setActive);
			}),
			api.getArchivedExecs().then((result) => {
				if (!result.ok) {
					return;
				}

				if (!result.value.length) {
					return;
				}

				const lastSeen = this.storage.get('lastSeenEndedAt');
				const lastSeenMs = lastSeen && +new Date(lastSeen);

				this.setState((s) => {
					result.value.forEach((data, i) => {
						const entry = new Entry<ArchivedEntry>(data);

						s.archived.set(data.execId, entry);

						if (
							lastSeenMs &&
							s.unseenCount === 0 &&
							+entry.state.endedAt > lastSeenMs
						) {
							s.unseenCount = result.value.length - i;
						}
					});

					if (!lastSeenMs) {
						s.unseenCount = result.value.length;
					}
				});
			}),
		]);

		ws.subscribe('script-status', (data) => {
			if (data.active) {
				this.setActive(data);
			} else {
				this.setArchived(data);
			}
		});
	}

	private setActive = (data: ExecStartData) => {
		const startedAt = new Date(data.startedAt);
		const delta = Date.now() - +startedAt;

		setTimeout(() => {
			if (this.state.archived.has(data.execId)) {
				return;
			}

			this.setState((state) => {
				state.active.set(data.execId, new Entry<ActiveEntry>(data));
			});
		}, ACTIVE_STATUS_DELAY - delta);
	};

	private setArchived = (data: ExecEndData) => {
		this.setState((state) => {
			let archiveEntry: Entry<ArchivedEntry>;
			const activeEntry = this.state.active.get(data.execId);

			if (activeEntry) {
				state.active.delete(data.execId);
				archiveEntry = activeEntry.archive(data);
			} else {
				archiveEntry = new Entry<ArchivedEntry>(data);
			}

			state.archived.set(data.execId, archiveEntry);
			state.unseenCount++;
		});
	};

	clearUnseen = () => {
		this.setState((state) => {
			state.unseenCount = 0;
		});
	};

	saveLastSeen = (entry?: Entry<ArchivedEntry>) => {
		if (entry) {
			this.storage.set(
				'lastSeenEndedAt',
				entry.state.endedAt.toISOString()
			);
		}
	};
}

export const archiveStore = new ArchiveStore();

class Entry<
	T extends ActiveEntry | ArchivedEntry | CombinedEntry,
> extends ComponentStore<T> {
	state: T;

	constructor(data: T extends ActiveEntry ? ExecStartData : ExecEndData) {
		super();

		const { fileId, execId, path, startedAt, textVersion } = data;

		const entry: CombinedEntry = {
			active: true,
			execId,
			fileId,
			path,
			startedAt: new Date(startedAt),
			textVersion,
			name: getFilename(path),
			duration: undefined,
			endedAt: undefined,
			exitCode: undefined,
			hasOutput: undefined,
			output: undefined,
		};

		const scriptExists = filesStore.state.files.has(fileId);
		if (scriptExists) {
			const unsubscribe = filesStore.subscribe(
				(s) => s.files,
				(files) => {
					const file = files.get(fileId);

					if (!file) {
						unsubscribe();
						return;
					}

					if (file.path !== this.state.path) {
						this.setState((s) => {
							s.path = file.path;
							s.name = getFilename(file.path);
						});
					}
				}
			);
		}

		this.state = entry as any;

		if (!data.active) {
			this.archive(data);
		}
	}

	archive = (data: ExecEndData) => {
		const { endedAt, exitCode, hasOutput } = data;

		this.setState((s) => {
			const state = s as ArchivedEntry;

			state.active = false;
			state.endedAt = new Date(endedAt);
			state.duration = +state.endedAt - +state.startedAt;
			state.exitCode = exitCode;
			state.hasOutput = hasOutput;
		});

		return this as Entry<ArchivedEntry>;
	};

	fetchOutput = async (): Promise<void> => {
		const { active, hasOutput, execId, fileId } = this
			.state as CombinedEntry;

		if (active || !hasOutput) {
			return;
		}

		const scriptStore = filesStore.state.files.get(fileId)?.scriptStore;

		if (scriptStore?.state.execId === execId) {
			this.setState((s) => {
				(s as ArchivedEntry).output = scriptStore.state.output;
			});
		}

		const result = await api.getScriptOutput(execId);

		if (!result.ok) {
			const error: OutputLine[] = [
				{
					isError: true,
					text: result.error.message,
					order: 0,
					timestamp: new Date().toTimeString(),
				},
			];
			this.setState((s) => {
				(s as ArchivedEntry).output = error;
			});
			return;
		}

		const lines: OutputLine[] = result.value.map((data) => ({
			text: data.line,
			isError: data.type === 'stderr',
			order: data.order,
			timestamp: data.timestamp,
		}));

		this.setState((s) => {
			(s as ArchivedEntry).output = lines;
		});
	};
}
