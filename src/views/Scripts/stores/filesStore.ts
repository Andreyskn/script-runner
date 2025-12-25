import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';
import { ScriptStore } from '@/views/Scripts/stores/scriptStore';

type ScriptPath = string;

type State = {
	files: Set<ScriptPath>;
	selectedScript: ScriptStore | null;
	activeScripts: Set<ScriptPath>;
};

// TODO: minimize client-side logic, rely on updates from server

export class FilesStore extends ComponentStore<State> {
	state: State = {
		selectedScript: null,
		files: new Set(),
		activeScripts: new Set(),
	};

	#scripts = new Map<ScriptPath, ScriptStore>();

	constructor() {
		super();

		Promise.all([
			api.getFilesList().then((paths) => {
				this.setState((state) => {
					paths.forEach((p) => state.files.add(p));
				});
			}),
			api.getActiveScripts().then((paths) => {
				this.setState((state) => {
					paths.forEach((p) => state.activeScripts.add(p));
				});
			}),
		]);

		ws.subscribe('script-status', ({ path, status }) => {
			this.setState((state) => {
				switch (status) {
					case 'running': {
						state.activeScripts.add(path);
						break;
					}
					case 'ended': {
						state.activeScripts.delete(path);
						break;
					}
				}
			});
		});
	}

	moveFile = async (oldPath: string, newPath: string) => {
		const patches: ((state: State) => void)[] = [];

		const enqueuePatch = (path: string) => {
			patches.push((state) => {
				const modifiedPath = path.replace(oldPath, newPath);

				state.files.delete(path);
				state.files.add(modifiedPath);

				const script = this.#scripts.get(path);

				if (script) {
					script.setPath(modifiedPath);
					this.#scripts.delete(path);
					this.#scripts.set(modifiedPath, script);
				}
			});
		};

		if (oldPath.endsWith('.sh')) {
			enqueuePatch(oldPath);
		} else {
			const pathWithSlash = oldPath + '/';

			this.state.files.forEach((p) => {
				if (p === oldPath || p.startsWith(pathWithSlash)) {
					enqueuePatch(p);
				}
			});
		}

		this.setState((state) => {
			patches.forEach((patch) => patch(state));
		});

		await api.moveFile(oldPath, newPath);
	};

	createFile = async (path: string) => {
		this.setState((state) => {
			state.files.add(path);
		});

		if (path.endsWith('.sh')) {
			await api.createScript(path);
			await this.setSelectedScript(path);
		} else {
			await api.createFolder(path);
		}
	};

	deleteFile = async (path: string, clientSideOnly?: boolean) => {
		this.setState((state) => {
			state.files.delete(path);
			this.#scripts.delete(path);

			if (!path.endsWith('.sh')) {
				const pathWithSlash = path + '/';

				state.files.forEach((p) => {
					if (p.startsWith(pathWithSlash)) {
						state.files.delete(p);
						this.#scripts.delete(p);
					}
				});
			}

			const { selectedScript } = this.state;

			if (selectedScript && !this.#scripts.has(selectedScript.path)) {
				state.selectedScript = null;
			}
		});

		if (!clientSideOnly) {
			await api.deleteFile(path);
		}
	};

	getScript = async (path: ScriptPath) => {
		if (this.#scripts.has(path)) {
			return this.#scripts.get(path)!;
		}

		const isRunning = this.state.activeScripts.has(path);
		const script = ScriptStore.init(path, isRunning);

		this.#scripts.set(path, script);
		return script;
	};

	setSelectedScript = async (path: ScriptPath) => {
		const script = await this.getScript(path);

		this.setState((state) => {
			state.selectedScript = script;
		});
	};
}
