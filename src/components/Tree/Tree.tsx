import { useContextMenu } from '@/components/ContextMenu';
import { File, type FileProps } from '@/components/Tree/File';
import { Folder, type FolderProps } from '@/components/Tree/Folder';
import {
	NameEditor,
	type TreeNodeRenameHandler,
} from '@/components/Tree/NameEditor';
import { DnDProvider, useDnD, type DnDProviderProps } from 'src/utils/dnd';
import { cls } from './Tree.styles';

// TODO: arrows navigation

type TreeNodeBase = {
	id: string;
	name: string;
};

export type FileNode = TreeNodeBase & {
	type: 'file';
};

export type FolderNode = TreeNodeBase & {
	type: 'folder';
	nodes: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

export type TreeNodeWithPath = Omit<TreeNode, 'nodes'> & {
	path: string[];
};

export type TreeDragData = {
	type: TreeNode['type'];
	id: string;
	name: string;
	path: string[];
};

export type TreeDropData = {
	id: string;
	name: string;
	path: string[];
};

export type TreeProps = {
	nodes: TreeNode[];
	activePath?: string[];
	onFileSelect?: FileProps['onSelect'];
	onNodeMove?: DnDProviderProps<TreeDragData, TreeDropData>['onDrop'];
	onRename?: TreeNodeRenameHandler;
};

type TreeBaseProps = OmitType<TreeProps, 'onNodeMove'> & {
	rootPath?: string[];
	setRef?: (el: HTMLDivElement | null) => void;
	highlighted?: boolean;
	outlined?: boolean;
};

export const Tree: React.FC<TreeProps> = (props) => {
	const { onNodeMove, onRename, ...restProps } = props;

	const handleDrop = (source: TreeDragData, target: TreeDropData) => {
		onNodeMove?.(source, target);
	};

	const canDrop = (source: TreeDragData, target: TreeDropData) => {
		const parentDir = source.path.slice(0, -1);

		if (source.type === 'file') {
			if (target.path.length !== parentDir.length) {
				return true;
			}

			return !parentDir.every((v, i) => v === target.path[i]);
		} else {
			if (
				target.path.length === parentDir.length &&
				parentDir.every((v, i) => v === target.path[i])
			) {
				return false;
			}

			return !source.path.every((v, i) => v === target.path[i]);
		}
	};

	return (
		<DnDProvider onDrop={handleDrop} canDrop={canDrop}>
			<NameEditor onRename={onRename} />
			<TreeMiddle {...restProps} />
		</DnDProvider>
	);
};

const TreeMiddle: React.FC<TreeProps> = (props) => {
	const { useDropTarget } = useDnD<TreeDragData, TreeDropData>();
	const { dropTarget, hasDragOver } = useDropTarget<HTMLDivElement>(() => ({
		id: '',
		name: '',
		path: [],
	}));

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{ icon: 'file-text', text: 'New Script', onClick: () => {} },
		{ icon: 'folder', text: 'New Folder', onClick: () => {} },
	]);

	return (
		<TreeBase
			{...props}
			setRef={(el) => {
				dropTarget.current = el;
				contextMenuTrigger.current = el;
			}}
			highlighted={hasDragOver}
			outlined={isContextMenuOpen}
		/>
	);
};
let openFolders = new Set<FolderNode['id']>();

const TreeBase: React.FC<TreeBaseProps> = (props) => {
	const {
		nodes,
		activePath,
		onFileSelect,
		rootPath = [],
		setRef,
		highlighted,
		outlined,
	} = props;

	const handleFolderOpenChange: FolderProps['onOpenChange'] = (
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
				if (n.type === 'file') {
					return (
						<File
							key={n.id}
							id={n.id}
							name={n.name}
							path={[...rootPath, n.name]}
							open={activePath?.[0] === n.name}
							onSelect={onFileSelect}
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
							onOpenChange={handleFolderOpenChange}
						>
							<TreeBase
								nodes={n.nodes}
								activePath={activePath && activePath.slice(1)}
								rootPath={[...rootPath, n.name]}
								onFileSelect={onFileSelect}
							/>
						</Folder>
					);
				}
			})}
		</div>
	);
};
