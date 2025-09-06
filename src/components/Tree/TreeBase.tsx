import { File } from '@/components/Tree/File';
import { Folder, type FolderProps } from '@/components/Tree/Folder';
import { useTreeStore } from '@/components/Tree/treeStore';
import type {
	FolderNode,
	TreeBaseProps,
	TreeNode,
} from '@/components/Tree/treeTypes';

import { cls } from './Tree.styles';

// TODO: handle deleted and moved folders
let openFolders = new Set<FolderNode['id']>();

const collator = new Intl.Collator('en', { numeric: true });

const sortNodes = (nodes: TreeNode[]) => {
	return nodes.toSorted((a, b) => {
		if (a.type === b.type) {
			return collator.compare(a.name, b.name);
		}

		if (a.type === 'file' && b.type === 'folder') {
			return 1;
		} else {
			return -1;
		}
	});
};

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

	const { tmpNode } = useTreeStore(rootPath);

	if (tmpNode) {
		nodes = [...nodes, tmpNode];
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
			{sortNodes(nodes).map((n) => {
				if (n.type === 'file') {
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
