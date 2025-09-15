import type { FolderNode, TreeNode } from '@/components/Tree';
import { ComponentStore } from '@/utils';
import { ScriptStore } from '@/views/Scripts/stores/scriptStore';

type ScriptPath = string;

type State = {
	nodes: TreeNode[];
	selectedScript: ScriptStore | null;
};

export class FilesStore extends ComponentStore<State> {
	state: State = {
		nodes: [],
		selectedScript: null,
	};

	files = new Set<ScriptPath>();

	#scripts = new Map<ScriptPath, ScriptStore>();

	constructor() {
		super();

		this.initNodes();
	}

	initNodes = async () => {
		const result = await fetch('http://localhost:3001/api/file/list');
		const { files } = (await result.json()) as { files: string[] };

		files.forEach((f) => this.files.add(f));
		this.updateNodes();
	};

	updateNodes = () => {
		const root: FolderNode = {
			id: '',
			name: '',
			type: 'folder',
			nodes: [],
		};

		const folders = new Map<string, FolderNode>([['', root]]);

		this.files.forEach((path) => {
			const pathSegments = path.split('/');

			pathSegments.forEach((segment, i) => {
				const parentPath = pathSegments.slice(0, i).join('/');
				const currentPath = pathSegments.slice(0, i + 1).join('/');

				if (!folders.has(parentPath)) {
					const parentNode: FolderNode = {
						id: parentPath,
						name: pathSegments[i - 1]!,
						type: 'folder',
						nodes: [],
					};

					folders.set(parentPath, parentNode);
					const parentParentPath = pathSegments
						.slice(0, i - 1)
						.join('/');
					folders.get(parentParentPath)!.nodes!.push(parentNode);
				}

				const parentNode = folders.get(parentPath) as FolderNode;

				if (segment.endsWith('.sh')) {
					parentNode.nodes!.push({
						id: currentPath,
						name: segment,
						type: 'file',
					});
				} else if (!folders.has(currentPath)) {
					const node: FolderNode = {
						id: currentPath,
						name: segment,
						type: 'folder',
						nodes: [],
					};
					parentNode.nodes!.push(node);
					folders.set(currentPath, node);
				}
			});
		});

		this.setState((state) => {
			state.nodes = root.nodes!;
		});
	};

	moveNode = (oldPath: string, newPath: string) => {
		const patches: (() => void)[] = [];

		const enqueuePatch = (path: string) => {
			patches.push(() => {
				const modifiedPath = path.replace(oldPath, newPath);

				this.files.delete(path);
				this.files.add(modifiedPath);

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

			this.files.forEach((p) => {
				if (p === oldPath || p.startsWith(pathWithSlash)) {
					enqueuePatch(p);
				}
			});
		}

		patches.forEach((patch) => patch());

		this.updateNodes();

		fetch(`http://localhost:3001/api/file/move`, {
			method: 'POST',
			body: JSON.stringify({ oldPath, newPath }),
		});
	};

	createNode = async (path: string) => {
		this.files.add(path);

		this.updateNodes();

		await fetch(`http://localhost:3001/api/file`, {
			method: 'POST',
			body: JSON.stringify({ path }),
		});

		if (path.endsWith('.sh')) {
			await this.setSelectedScript(path);
		}
	};

	deleteNode = async (path: string, clientSideOnly?: boolean) => {
		this.files.delete(path);
		this.#scripts.delete(path);

		if (!path.endsWith('.sh')) {
			const pathWithSlash = path + '/';

			this.files.forEach((p) => {
				if (p.startsWith(pathWithSlash)) {
					this.files.delete(p);
					this.#scripts.delete(p);
				}
			});
		}

		const { selectedScript } = this.state;

		if (selectedScript && !this.#scripts.has(selectedScript.path)) {
			this.setState((state) => {
				state.selectedScript = null;
			});
		}

		this.updateNodes();

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
