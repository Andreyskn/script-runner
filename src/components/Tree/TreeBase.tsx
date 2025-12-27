import { File } from '@/components/Tree/File';
import { Folder, type FolderProps } from '@/components/Tree/Folder';
import { treeStore } from '@/components/Tree/treeStore';
import type { FolderNode, TreeBaseProps } from '@/components/Tree/treeTypes';
import { isMatchingPath, sortNodes } from '@/components/Tree/treeUtils';

import { cls } from './Tree.styles';

const openFolders = new Set<FolderNode['id']>();

export const TreeBase: React.FC<TreeBaseProps> = (props) => {
	let { nodes = [] } = props;
	const {
		activePath,
		onFileSelect,
		rootPath = [],
		setRef,
		highlighted,
		outlined,
		onDelete,
		onCreate,
	} = props;

	const tmpNode = treeStore.useSelector(
		(state) => state.tmpNode,
		(tmpNode) => {
			if (
				tmpNode &&
				isMatchingPath(rootPath, tmpNode.parent.path, { exact: true })
			) {
				return tmpNode.node;
			}
		}
	);

	if (tmpNode) {
		nodes = sortNodes([...nodes, tmpNode]);
	}

	const handleFolderOpenToggle: FolderProps['onToggleOpen'] = (
		id,
		isOpen
	) => {
		if (isOpen) {
			openFolders.add(id);
		} else {
			openFolders.delete(id);
		}
	};

	return (
		<div className={cls.tree.block({ highlighted, outlined })} ref={setRef}>
			{nodes.map((n) => {
				if (n.type === 'script') {
					return (
						<File
							key={n.id}
							id={n.id}
							name={n.name}
							path={[...rootPath, n.name]}
							open={activePath?.[0] === n.name}
							onSelect={onFileSelect}
							onDelete={onDelete}
							renameOnMount={n.isTemporary}
						/>
					);
				} else {
					return (
						<Folder
							key={n.id}
							id={n.id}
							name={n.name}
							path={[...rootPath, n.name]}
							open={
								activePath?.[0] === n.name ||
								openFolders.has(n.id)
							}
							onToggleOpen={handleFolderOpenToggle}
							onDelete={onDelete}
							onCreate={onCreate}
							renameOnMount={n.isTemporary}
						>
							<TreeBase
								nodes={n.nodes}
								activePath={activePath && activePath.slice(1)}
								rootPath={[...rootPath, n.name]}
								onFileSelect={onFileSelect}
								onDelete={onDelete}
								onCreate={onCreate}
							/>
						</Folder>
					);
				}
			})}
		</div>
	);
};
