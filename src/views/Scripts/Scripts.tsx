import { showDeleteConfirmDialog } from '@/components/Dialog/DeleteConfirmDialog';
import { showReplaceConfirmDialog } from '@/components/Dialog/ReplaceConfirmDialog';
import { Section } from '@/components/Section';
import { Tree, type TreeProps } from '@/components/Tree';
import { Placeholder } from '@/views/Scripts/Placeholder';
import { ScriptViewer } from '@/views/Scripts/ScriptViewer';
import { FilesStore } from '@/views/Scripts/stores/filesStore';

import { cls } from './Scripts.styles';

export type ScriptsProps = {};

export const Scripts: React.FC<ScriptsProps> = (props) => {
	const {} = props;

	const {
		selectors: { nodes, selectedScript },
		files,
		setSelectedScript,
		moveNode,
		createNode,
		deleteNode,
	} = FilesStore.use();

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

			moveNode(
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
						}

						moveNode(source.path.join('/'), newPath);
					}}
					onRename={handleRename}
					onCreate={({ path, name, type }) => {
						if (type === 'file' && !name.endsWith('.sh')) {
							name = `${name}.sh`;
						}
						createNode([...path, name].filter(Boolean).join('/'));
					}}
					onDelete={async (node) => {
						const isConfirmed = await showDeleteConfirmDialog(node);

						if (isConfirmed) {
							deleteNode(node.path.join('/'));
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
