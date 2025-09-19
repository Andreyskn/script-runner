import { showDeleteConfirmDialog } from '@/components/Dialog/DeleteConfirmDialog';
import { showReplaceConfirmDialog } from '@/components/Dialog/ReplaceConfirmDialog';
import { Section } from '@/components/Section';
import { Tree, type FolderNode, type TreeProps } from '@/components/Tree';
import { Placeholder } from '@/views/Scripts/Placeholder';
import { ScriptViewer } from '@/views/Scripts/ScriptViewer';
import { FilesStore } from '@/views/Scripts/stores/filesStore';

import { cls } from './Scripts.styles';

const getNodes = (files: FilesStore['state']['files']) => {
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
				const parentParentPath = pathSegments.slice(0, i - 1).join('/');
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

	return { nodes: root.nodes! };
};

export type ScriptsProps = {};

export const Scripts: React.FC<ScriptsProps> = (props) => {
	const {} = props;

	const {
		selectors: { files, selectedScript },
		setSelectedScript,
		moveFile,
		createFile,
		deleteFile,
		useSelector,
	} = FilesStore.use();

	const { nodes } = useSelector((state) => state.files, getNodes);

	const handleRename: TreeProps['onRename'] = {
		before(node) {
			if (node.type === 'file') {
				return {
					text: node.name.slice(0, node.name.lastIndexOf('.sh')),
				};
			}
		},
		change(node, newName) {
			if (!newName) {
				return {
					error: <>A {node.type} name must be provided.</>,
				};
			}

			if (node.type === 'file' && !newName.endsWith('.sh')) {
				newName = `${newName}.sh`;
			}

			const path = node.path.toSpliced(-1, 1, newName).join('/');

			if (files.has(path)) {
				return {
					error: (
						<>
							A {node.type} <b>"{newName}"</b> already exists in
							this location. Please choose a different name.
						</>
					),
				};
			}
		},
		confirm(node, newName) {
			if (node.type === 'file' && !newName.endsWith('.sh')) {
				newName = `${newName}.sh`;
			}

			moveFile(
				node.path.join('/'),
				node.path.toSpliced(-1, 1, newName).join('/')
			);
		},
	};

	return (
		<div className={cls.scripts.block()}>
			<Section
				header={<div>SCRIPTS</div>}
				className={cls.scripts.treeSection()}
				headerClassName={cls.scripts.treeSectionTitle()}
				contentClassName={cls.scripts.treeSectionContent()}
			>
				<Tree
					activePath={selectedScript?.path.split('/') ?? undefined}
					onFileSelect={setSelectedScript}
					nodes={nodes}
					onMove={async (source, target) => {
						const newPath = [...target.path, source.name]
							.filter(Boolean)
							.join('/');

						if (files.has(newPath)) {
							const isConfirmed =
								await showReplaceConfirmDialog(source);

							if (!isConfirmed) {
								return;
							}

							deleteFile(newPath, true);
						}

						moveFile(source.path.join('/'), newPath);
					}}
					onRename={handleRename}
					onCreate={({ path, name, type }) => {
						if (type === 'file' && !name.endsWith('.sh')) {
							name = `${name}.sh`;
						}
						createFile([...path, name].filter(Boolean).join('/'));
					}}
					onDelete={async (node) => {
						const isConfirmed = await showDeleteConfirmDialog(node);

						if (isConfirmed) {
							deleteFile(node.path.join('/'));
						}
					}}
				/>
			</Section>
			{selectedScript ? (
				<ScriptViewer script={selectedScript} />
			) : (
				<Placeholder />
			)}
		</div>
	);
};
