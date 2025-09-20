import { ComponentStore } from '@/utils';
import { ScriptStore } from '@/views/Scripts/stores/scriptStore';

type ScriptPath = string;

type State = {
	files: Set<ScriptPath>;
	selectedScript: ScriptStore | null;
};

export class FilesStore extends ComponentStore<State> {
	state: State = {
		selectedScript: null,
		files: new Set(),
	};

	#scripts = new Map<ScriptPath, ScriptStore>();

	constructor() {
		super();

		(async () => {
			const result = await fetch('http://localhost:3001/api/file/list');
			const { files } = (await result.json()) as { files: string[] };

			this.setState((state) => {
				files.forEach((f) => state.files.add(f));
			});
		})();
	}

	moveFile = (oldPath: string, newPath: string) => {
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

		fetch(`http://localhost:3001/api/file/move`, {
			method: 'POST',
			body: JSON.stringify({ oldPath, newPath }),
		});
	};

	createFile = async (path: string) => {
		this.setState((state) => {
			state.files.add(path);
		});

		await fetch(`http://localhost:3001/api/file`, {
			method: 'POST',
			body: JSON.stringify({ path }),
		});

		if (path.endsWith('.sh')) {
			await this.setSelectedScript(path);
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
			await fetch(`http://localhost:3001/api/file`, {
				method: 'DELETE',
				body: JSON.stringify({ path }),
			});
		}
	};

	getScript = async (path: ScriptPath) => {
		if (this.#scripts.has(path)) {
			return this.#scripts.get(path)!;
		}

		const script = ScriptStore.init(path);

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
