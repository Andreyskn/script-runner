import { useRef } from 'react';

import { showDeleteConfirmDialog } from '@/components/Dialog/DeleteConfirmDialog/dialogApi';
import { showReplaceConfirmDialog } from '@/components/Dialog/ReplaceConfirmDialog/dialogApi';
import { showScriptDialog } from '@/components/Dialog/ScriptDialog';
import { Section } from '@/components/Section';
import {
	Tree,
	type FolderNode,
	type TreeNode,
	type TreeProps,
} from '@/components/Tree';
import { sortNodes } from '@/components/Tree/treeUtils';
import { Responsive, useBreakpoint } from '@/utils';
import { Placeholder } from '@/views/Scripts/Placeholder';
import { ScriptViewer } from '@/views/Scripts/ScriptViewer';
import {
	filesStore,
	type File,
	type FilesStore,
} from '@/views/Scripts/stores/filesStore';

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
		const parentPath = path.slice(0, -name.length - 1);
		const node: TreeNode = { id, name, type };

		if (type === 'folder') {
			(node as FolderNode).nodes = [];
			folders.set(path, node as FolderNode);
		}

		folders.get(parentPath)!.nodes!.push(node);
		byPath.set(path, file);
	});

	return { nodes: root.nodes!, byPath };
};

export type ScriptsProps = {};

export const Scripts: React.FC<ScriptsProps> = () => {
	const { setSelectedScript, moveFile, createFile, deleteFile, useSelector } =
		filesStore;

	const { nodes, byPath } = useSelector((state) => state.files, getNodes);
	const selectedScript = useSelector(
		(state) => [state.selectedScriptId, state.files] as const,
		([id, files]) => (typeof id === 'number' ? files.get(id) : undefined)
	);

	const byPathRef = useRef(byPath);
	byPathRef.current = byPath;

	const { desktopScreenRef } = useBreakpoint({ disableAutoUpdate: true });

	const handleScriptSelect: TreeProps['onFileSelect'] = (id) => {
		if (desktopScreenRef.current) {
			setSelectedScript(id);
		} else {
			const script = filesStore.state.files.get(id)!;
			showScriptDialog({ script });
		}
	};

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

			if (node.name === newName) {
				return;
			}

			const path = node.path.toSpliced(-1, 1, newName).join('/');

			if (byPathRef.current.has(path)) {
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

			if (node.name !== newName) {
				moveFile(
					node.id,
					node.path.toSpliced(-1, 1, newName).join('/')
				);
			}
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
					onFileSelect={handleScriptSelect}
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
			<Responsive
				desktopScreen={
					selectedScript ? (
						<ScriptViewer script={selectedScript} />
					) : (
						<Placeholder />
					)
				}
			/>
		</div>
	);
};
