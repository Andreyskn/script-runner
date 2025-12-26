import { FileTextIcon, FolderIcon } from 'lucide-react';

import { useContextMenu } from '@/components/ContextMenu';
import { NameEditor, type NameEditorProps } from '@/components/Tree/NameEditor';
import { TreeBase } from '@/components/Tree/TreeBase';
import { treeStore } from '@/components/Tree/treeStore';
import type {
	FolderNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeMiddleProps,
	TreeProps,
} from '@/components/Tree/treeTypes';
import { isMatchingPath } from '@/components/Tree/treeUtils';
import { DnDProvider, useDnD } from '@/utils';

// TODO: optimize nodes rerender
// TODO: arrows navigation
// TODO: scroll active node into view
// TODO: add action buttons (collapse folders, etc.)

export const Tree: React.FC<TreeProps> = (props) => {
	const { onMove, onRename, onCreate, ...restProps } = props;

	const createNode: TreeMiddleProps['onCreate'] = (type, parent) => {
		treeStore.setTmpNode({
			node: {
				isTemporary: true,
				id: -10,
				name: '',
				type,
			},
			parent,
		});
	};

	const handleRename: NameEditorProps['onRename'] = {
		before: onRename?.before,
		change: onRename?.change,
		cancel(node) {
			if (node.id === treeStore.state.tmpNode?.node.id) {
				treeStore.setTmpNode(null);
			} else {
				onRename?.cancel?.(node);
			}
		},
		confirm(node, name) {
			if (node.id === treeStore.state.tmpNode?.node.id) {
				treeStore.setTmpNode(null);
				onCreate?.({ name, path: node.path, type: node.type });
			} else {
				onRename?.confirm?.(node, name);
			}
		},
	};

	const handleDrop = (source: TreeDragData, target: TreeDropData) => {
		onMove?.(source, target);
	};

	const canDrop = (source: TreeDragData, target: TreeDropData) => {
		const parentDir = source.path.slice(0, -1);

		if (source.type === 'script') {
			if (target.path.length !== parentDir.length) {
				return true;
			}

			return !isMatchingPath(parentDir, target.path);
		} else {
			if (isMatchingPath(parentDir, target.path, { exact: true })) {
				return false;
			}

			return !isMatchingPath(source.path, target.path);
		}
	};

	return (
		<DnDProvider onDrop={handleDrop} canDrop={canDrop}>
			<NameEditor onRename={handleRename} />
			<TreeMiddle {...restProps} onCreate={createNode} />
		</DnDProvider>
	);
};

const TreeMiddle: React.FC<TreeMiddleProps> = (props) => {
	const { onCreate } = props;

	const root: FolderNodeWithPath = {
		id: -1,
		name: '',
		path: [],
		type: 'folder',
	};

	const { useDropTarget } = useDnD<TreeDragData, TreeDropData>();
	const { dropTarget, hasDragOver } = useDropTarget(() => root);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{
			icon: <FileTextIcon />,
			text: 'New Script',
			onClick: () => onCreate('script', root),
		},
		{
			icon: <FolderIcon />,
			text: 'New Folder',
			onClick: () => onCreate('folder', root),
		},
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
