import type { FileProps } from '@/components/Tree/File';
import type { FolderProps } from '@/components/Tree/Folder';
import type { TreeNodeRenameHandler } from '@/components/Tree/NameEditor';
import type { DnDProviderProps } from 'src/utils/dnd';

export type TreeNodeType = 'file' | 'folder';

type TreeNodeBase = {
	id: string;
	name: string;
	isTemporary?: boolean;
};

export type FileNode = TreeNodeBase & {
	type: ExtractType<TreeNodeType, 'file'>;
};

export type FolderNode = TreeNodeBase & {
	type: ExtractType<TreeNodeType, 'folder'>;
	nodes?: TreeNode[];
};

export type TreeNode = FileNode | FolderNode;

export type TemporaryNode = {
	node: TreeNode;
	parent: FolderNodeWithPath;
};

export type FileNodeWithPath = FileNode & {
	path: string[];
};

export type FolderNodeWithPath = OmitType<FolderNode, 'nodes'> & {
	path: string[];
};

export type TreeNodeWithPath = FileNodeWithPath | FolderNodeWithPath;

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
	onMove?: DnDProviderProps<TreeDragData, TreeDropData>['onDrop'];
	onRename?: TreeNodeRenameHandler;
	onCreate?: (data: Pick<TreeNodeWithPath, 'name' | 'path' | 'type'>) => void;
	onDelete?: (node: TreeNodeWithPath) => void;
};

export type TreeMiddleProps = Replace<
	OmitType<TreeProps, 'onMove' | 'onRename'>,
	{
		onCreate: FolderProps['onCreate'];
	}
>;

export type TreeBaseProps = Replace<
	TreeMiddleProps,
	{
		nodes?: TreeNode[];
	}
> & {
	rootPath?: string[];
	setRef?: (el: HTMLDivElement | null) => void;
	highlighted?: boolean;
	outlined?: boolean;
};
