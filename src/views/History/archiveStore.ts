import type { FileId } from '@server/files';
import type { ExecEndData, ExecId, ExecStartData } from '@server/runner';

import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';

import { filesStore } from '../Scripts/stores/filesStore';

export type ActiveEntry = {
	active: true;
	name: string;
	path: string;
	startedAt: Date;
	fileId: FileId;
	execId: ExecId;

	// TODO: Clicking an archived script name should
	// display the script's text as it was at execution time
	textVersion: number;

	archive: (data: ExecEndData) => ArchivedEntry;
};

export type ArchivedEntry = Replace<
	OmitType<ActiveEntry, 'archive'>,
	{ active: false }
> & {
	exitCode: number;
	hasOutput: boolean;
	endedAt: Date;
};

type CombinedEntry = Combine<ActiveEntry | ArchivedEntry>;

type State = {
	active: Map<ExecId, ActiveEntry>;
	archived: Map<ExecId, ArchivedEntry>;
	unseenCount: number;
};

/** Minimal execution time for a script to be placed on the active list  */
const minExecTimeForActive = 1000;

class ArchiveStore extends ComponentStore<State> {
	state: State = {
		active: new Map(),
		archived: new Map(),
		unseenCount: 0,
	};

	constructor() {
		super();

		api.getActiveScripts().then((result) => {
			if (!result.ok) {
				return;
			}

			result.value.forEach(this.setActive);
		});

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

		if (delta >= minExecTimeForActive) {
			this.setState((state) => {
				state.active.set(data.execId, createEntry(data));
			});
		}

		setTimeout(() => {
			if (this.state.archived.has(data.execId)) {
				return;
			}

			this.setState((state) => {
				state.active.set(data.execId, createEntry(data));
			});
		}, minExecTimeForActive - delta);
	};

	private setArchived = (data: ExecEndData) => {
		this.setState((state) => {
			let archiveEntry: ArchivedEntry;
			const activeEntry = this.state.active.get(data.execId);

			if (activeEntry) {
				state.active.delete(data.execId);
				archiveEntry = activeEntry.archive(data);
			} else {
				archiveEntry = createEntry(data);
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
}

export const archiveStore = ArchiveStore.init();

const createEntry = <T extends ExecStartData | ExecEndData>(
	data: T
): T extends { active: true } ? ActiveEntry : ArchivedEntry => {
	const { fileId, execId, path, startedAt, active, textVersion } = data;

	const entry: CombinedEntry = {
		active,
		execId,
		fileId,
		path,
		startedAt: new Date(startedAt),
		textVersion,

		endedAt: active ? undefined : new Date(data.endedAt),
		exitCode: active ? undefined : data.exitCode,
		hasOutput: active ? undefined : data.hasOutput,

		get name() {
			return entry.path.slice(entry.path.lastIndexOf('/') + 1);
		},

		archive: active
			? (data: ExecEndData): ArchivedEntry => {
					const { endedAt, exitCode, hasOutput } = data;
					entry.active = false;

					Object.assign(entry, {
						archive: null as any,
						endedAt: new Date(endedAt),
						exitCode,
						hasOutput,
					} satisfies SymmetricDiff<ActiveEntry, ArchivedEntry>);

					return entry as ArchivedEntry;
				}
			: undefined,
	};

	const scriptExists = filesStore.state.files.has(fileId);

	if (scriptExists) {
		let lastKnownPath = path;

		Object.defineProperties(entry, {
			path: {
				get() {
					// FIXME: this updates during render only
					return filesStore.useSelector(
						(s) => s.files,
						(files) => {
							const file = files.get(fileId);

							if (!file) {
								return lastKnownPath;
							}

							lastKnownPath = file.path;
							return file.path;
						}
					);
				},
			},
		});
	}

	return entry as any;
};
