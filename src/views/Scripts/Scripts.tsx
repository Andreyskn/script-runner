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
		setSelectedScript,
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

			if (/* name collision */ 1 - 1) {
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
			console.log(node.name, '->', newName);
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
					onMove={(source, target) => {}}
					onRename={handleRename}
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
