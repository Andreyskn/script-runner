import type { ClientFileData, FileId } from '@server/files';

import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';
import { ScriptStore } from '@/views/Scripts/stores/scriptStore';

export type File = OmitType<ClientFileData, 'runningSince'> & {
	name: string;
	scriptStore: ScriptStore;
};

type State = {
	files: Map<FileId, File>;
	selectedScriptId: FileId | null;
	runningScripts: Set<FileId>;
};

export class FilesStore extends ComponentStore<State> {
	state: State = {
		selectedScriptId: null,
		files: new Map(),
		runningScripts: new Set(),
	};

	constructor() {
		super();

		Promise.all([
			api.getFilesList().then((result) => {
				if (!result.ok) {
					return;
				}

				this.setState((state) => {
					result.value.forEach((file) =>
						state.files.set(file.id, this.initFileData(file))
					);
				});
			}),
			api.getActiveScripts().then((result) => {
				if (!result.ok) {
					return;
				}

				this.setState((state) => {
					result.value.forEach((id) => state.runningScripts.add(id));
				});
			}),
		]);

		ws.subscribe('script-status', ({ id, status }) => {
			this.setState((state) => {
				switch (status) {
					case 'running': {
						state.runningScripts.add(id);
						break;
					}
					case 'ended': {
						state.runningScripts.delete(id);
						break;
					}
				}
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
							state.runningScripts.delete(id);
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
		const fileData: File = {
			id: file.id,
			get name() {
				return this.path.slice(this.path.lastIndexOf('/') + 1);
			},
			path: file.path,
			type: file.type,
			scriptStore: ScriptStore.init(file.id, file.runningSince),
		};

		return fileData;
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

	createFile = async (path: string) => {
		if (path.endsWith('.sh')) {
			const result = await api.createScript(path);

			if (result.ok) {
				this.setSelectedScript(result.value.id);
			}
		} else {
			await api.createFolder(path);
		}
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
