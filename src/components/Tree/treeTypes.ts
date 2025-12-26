import type { FileProps } from '@/components/Tree/File';
import type { FolderProps } from '@/components/Tree/Folder';
import type { TreeNodeRenameHandler } from '@/components/Tree/NameEditor';
import type { DnDProviderProps } from '@/utils';

export type TreeNodeType = 'script' | 'folder';

type TreeNodeBase = {
	id: number;
	name: string;
	isTemporary?: boolean;
};

export type FileNode = TreeNodeBase & {
	type: ExtractType<TreeNodeType, 'script'>;
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

export type FolderNodeWithPath = FolderNode & {
	path: string[];
};

export type TreeNodeWithPath = FileNodeWithPath | FolderNodeWithPath;

export type TreeDragData = {
	type: TreeNode['type'];
	id: TreeNode['id'];
	name: string;
	path: string[];
};

export type TreeDropData = {
	id: TreeNode['id'];
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
