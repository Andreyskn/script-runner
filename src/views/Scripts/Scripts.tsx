import { Section } from '@/components/Section';
import { Tree, type TreeNode, type TreeProps } from '@/components/Tree';
import { Placeholder } from '@/views/Scripts/Placeholder';
import { useState } from 'react';
import { cls } from './Scripts.styles';

export type ScriptsProps = {};

export const Scripts: React.FC<ScriptsProps> = (props) => {
	const {} = props;

	const [nodes, setNodes] = useState<TreeNode[]>([
		{
			id: '1',
			type: 'folder',
			name: 'automation',
			nodes: [
				{
					id: '11',
					type: 'folder',
					name: 'inner',
					nodes: [
						{
							id: '22',
							type: 'file',
							name: 'inner.sh',
						},
					],
				},
				{
					id: '2',
					type: 'file',
					name: 'backup.sh',
				},
				{
					id: '3',
					type: 'file',
					name: 'deploy.sh',
				},
			],
		},
		{
			id: '4',
			type: 'folder',
			name: 'monitoring',
			nodes: [
				{
					id: '5',
					type: 'file',
					name: 'health-check.sh',
				},
			],
		},
		{
			id: '6',
			type: 'folder',
			name: 'utilities',
			nodes: [
				{
					id: '7',
					type: 'file',
					name: 'cleanup.sh',
				},
			],
		},
		{ id: '8', type: 'file', name: 'test.sh' },
	]);

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
				contentClassName={cls.scripts.treeSectionContent()}
			>
				<Tree
					// activePath={['automation', 'inner', 'inner.sh']}
					// activePath={['utilities', 'cleanup.sh']}
					// activePath={['test.sh']}
					onFileSelect={console.log}
					nodes={nodes}
					onNodeMove={(source, target) => {}}
					onRename={handleRename}
				/>
			</Section>
			<Placeholder />
		</div>
	);
};
