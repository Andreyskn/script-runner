import type { ClientFileData, FileId } from '@server/files';

import { api, ws } from '@/api';
import { ComponentStore, parsePath } from '@/utils';
import { ScriptStore } from '@/views/Scripts/stores/scriptStore';

export type File = OmitType<ClientFileData, 'runningSince' | 'autorun'> & {
	scriptStore: ScriptStore;
	name: string;
	dir: string;
	ext: string;
};

type State = {
	files: Map<FileId, File>;
	selectedScriptId: FileId | null;
};

export class FilesStore extends ComponentStore<State> {
	state: State = {
		selectedScriptId: null,
		files: new Map(),
	};

	constructor() {
		super();

		this.packState({
			pack: () => ({
				selectedId: this.state.selectedScriptId,
			}),
			unpack: (data) => {
				this.state.selectedScriptId = data.selectedId;
			},
		});

		api.getFilesList().then((result) => {
			if (!result.ok) {
				return;
			}

			this.setState((state) => {
				result.value.forEach((file) =>
					state.files.set(file.id, this.initFileData(file))
				);
			});
		});

		ws.subscribe('files-change', (payload) => {
			if (payload.type === 'script-content') {
				return;
			}

			this.setState((state) => {
				switch (payload.type) {
					case 'create': {
						const { file } = payload;

						state.files.set(file.id, this.initFileData(file));
						break;
					}
					case 'delete': {
						const { ids } = payload;

						ids.forEach((id) => {
							state.files.get(id)?.scriptStore.cleanup();
							state.files.delete(id);
						});
						break;
					}
					case 'move': {
						const { files } = payload;

						files.forEach(({ id, path }) => {
							const target = this.state.files.get(id);

							if (target && target.path !== path) {
								state.files.get(id)!.path = path;
							}
						});
						break;
					}
				}
			});
		});
	}

	initFileData = (file: ClientFileData): File => {
		const { id, type, path, autorun, runningSince } = file;

		let lastParsedPath: File['path'] = undefined as any;
		let parseResult: ReturnType<typeof parsePath> = undefined as any;

		const getParsedPath = ({ path }: File) => {
			if (path === lastParsedPath) {
				return parseResult;
			}

			lastParsedPath = path;
			parseResult = parsePath(path);

			return parseResult;
		};

		return {
			id,
			path,
			type,
			scriptStore: new ScriptStore(id, autorun, runningSince),
			get name() {
				return getParsedPath(this).base;
			},
			get dir() {
				return getParsedPath(this).dir;
			},
			get ext() {
				return getParsedPath(this).ext;
			},
		} satisfies File;
	};

	moveFile = async (id: FileId, newPath: string) => {
		this.setState((s) => {
			s.files.get(id)!.path = newPath;
		});

		const result = await api.moveFile(id, newPath);

		if (!result.ok) {
			// TODO: handle error
		}
	};

	createScript = async (path: string) => {
		const result = await api.createScript(path);

		if (!result.ok) {
			// TODO: show notification
			return;
		}

		this.setSelectedScript(result.value.id);
	};

	createFolder = async (path: string) => {
		await api.createFolder(path);
	};

	deleteFile = async (id: FileId) => {
		await api.deleteFile(id);

		if (this.state.selectedScriptId === id) {
			this.setState((state) => {
				state.selectedScriptId = null;
			});
		}
	};

	setSelectedScript = (id: FileId) => {
		this.setState((state) => {
			state.selectedScriptId = id;
		});
	};
}

export const filesStore = new FilesStore();
