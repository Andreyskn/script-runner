import { useEffect, useRef } from 'react';

import { showDeleteConfirmDialog } from '@/components/Dialog/DeleteConfirmDialog';
import { showReplaceConfirmDialog } from '@/components/Dialog/ReplaceConfirmDialog';
import { Section } from '@/components/Section';
import {
	Tree,
	type FolderNode,
	type TreeNode,
	type TreeProps,
} from '@/components/Tree';
import { sortNodes } from '@/components/Tree/treeUtils';
import { Placeholder } from '@/views/Scripts/Placeholder';
import { ScriptViewer } from '@/views/Scripts/ScriptViewer';
import { FilesStore, type File } from '@/views/Scripts/stores/filesStore';

import { cls } from './Scripts.styles';

const getNodes = (files: FilesStore['state']['files']) => {
	const root: FolderNode = {
		id: -1,
		name: '',
		type: 'folder',
		nodes: [],
	};

	const sorted = sortNodes([...files.values()]);
	const folders = new Map<string, FolderNode>([['', root]]);
	const byPath = new Map<string, File>();

	sorted.forEach((file) => {
		const { id, name, path, type } = file;
		byPath.set(path, file);

		const parts = path.split('/');
		parts.pop();
		const parentPath = parts.join('/');

		const node: TreeNode = { id, name, type };

		if (type === 'folder') {
			(node as FolderNode).nodes = [];
			folders.set(path, node as FolderNode);
		}

		folders.get(parentPath)!.nodes!.push(node);
	});

	return { nodes: root.nodes!, byPath };
};

export type ScriptsProps = {};

export const Scripts: React.FC<ScriptsProps> = (props) => {
	const {} = props;

	const {
		selectors: { files },
		setSelectedScript,
		moveFile,
		createFile,
		deleteFile,
		useSelector,
	} = FilesStore.use();

	const { nodes, byPath } = useSelector((state) => state.files, getNodes);
	const { selectedScript } = useSelector(
		(state) => state.selectedScriptId,
		(id) => {
			return {
				selectedScript:
					typeof id === 'number' ? files.get(id) : undefined,
			};
		}
	);

	const byPathRef = useRef(byPath);
	useEffect(() => {
		byPathRef.current = byPath;
	}, [byPath]);

	const handleRename: TreeProps['onRename'] = {
		before(node) {
			if (node.type === 'script') {
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

			if (node.type === 'script' && !newName.endsWith('.sh')) {
				newName = `${newName}.sh`;
			}

			const path = node.path.toSpliced(-1, 1, newName).join('/');

			if (byPath.has(path)) {
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
			if (node.type === 'script' && !newName.endsWith('.sh')) {
				newName = `${newName}.sh`;
			}

			moveFile(node.id, node.path.toSpliced(-1, 1, newName).join('/'));
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
				<div />
				<Tree
					activePath={selectedScript?.path.split('/') ?? undefined}
					onFileSelect={setSelectedScript}
					nodes={nodes}
					onMove={async (source, target) => {
						const newPath = [...target.path, source.name]
							.filter(Boolean)
							.join('/');

						const collision = byPathRef.current.get(newPath);

						if (collision) {
							const isConfirmed =
								await showReplaceConfirmDialog(source);

							if (!isConfirmed) {
								return;
							}

							await deleteFile(collision.id);
						}

						await moveFile(source.id, newPath);
					}}
					onRename={handleRename}
					onCreate={({ path, name, type }) => {
						if (type === 'script' && !name.endsWith('.sh')) {
							name = `${name}.sh`;
						}
						createFile([...path, name].filter(Boolean).join('/'));
					}}
					onDelete={async (node) => {
						const isConfirmed = await showDeleteConfirmDialog(node);

						if (isConfirmed) {
							await deleteFile(node.id);
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
