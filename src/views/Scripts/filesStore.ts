import type { FolderNode, TreeNode } from '@/components/Tree';
import { ComponentStore } from '@/utils';

type ScriptPath = string;

export type ScriptData = {
	text: string;
	path: ScriptPath;
	name: string;
};

type State = {
	nodes: TreeNode[];
	selectedScript: ScriptData | null;
};

class FilesStore extends ComponentStore<State> {
	state: State = {
		nodes: [],
		selectedScript: null,
	};

	#cache = new Map<ScriptPath, ScriptData>();

	constructor() {
		super();

		this.initNodes();
	}

	initNodes = async () => {
		const result = await fetch('http://localhost:3001/api/files');
		const { files } = (await result.json()) as { files: string[] };

		const root: FolderNode = {
			id: '',
			name: '',
			type: 'folder',
			nodes: [],
		};

		const folders = new Map<string, FolderNode>([['', root]]);

		files.forEach((path) => {
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

	getScript = async (path: ScriptPath) => {
		if (this.#cache.has(path)) {
			return this.#cache.get(path)!;
		}

		const result = await fetch(
			`http://localhost:3001/api/script?path=${path}`
		);
		const text = await result.text();
		const data: ScriptData = {
			text,
			path,
			name: path.slice(path.lastIndexOf('/') + 1),
		};

		this.#cache.set(path, data);
		return data;
	};

	setSelectedScript = async (path: ScriptPath) => {
		const script = await this.getScript(path);

		this.setState((state) => {
			state.selectedScript = script;
		});
	};
}

const filesStore = new FilesStore();

export const useFilesStore = () => {
	return {
		setSelectedScript: filesStore.setSelectedScript,

		get nodes() {
			return filesStore.useSelector((state) => state.nodes);
		},

		get selectedScript() {
			return filesStore.useSelector((state) => state.selectedScript);
		},
	} satisfies Partial<FilesStore> & Partial<State> & Record<string, any>;
};
