import React, { useRef } from 'react';

import { FileTextIcon, PenSquareIcon, Trash2Icon } from 'lucide-react';

import { useContextMenu } from '@/components/ContextMenu';
import type {
	FileNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeNodeWithPath,
	TreeProps,
} from '@/components/Tree/treeTypes';
import { useDnD } from '@/utils';

import { useNameEditor } from '../NameEditor/nameEditorSession';
import { cls } from './File.styles';

export type FileProps = {
	id: number;
	path: string[];
	name: string;
	open?: boolean;
	renameOnMount?: boolean;
	onSelect?: (id: FileProps['id'], path: string[]) => void;
	onDelete?: (node: TreeNodeWithPath) => void;
	renderBadge?: TreeProps['renderNodeBadge'];
	extendContextMenu?: TreeProps['extendContextMenu'];
};

export const File: React.FC<FileProps> = (props) => {
	const {
		name,
		open,
		onSelect,
		id,
		path,
		renameOnMount,
		onDelete,
		renderBadge,
		extendContextMenu,
	} = props;

	const node = useRef<FileNodeWithPath>(null as any);
	node.current = {
		id,
		name,
		path,
		type: 'script',
	};

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor(
		() => node.current,
		renameOnMount
	);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		...(extendContextMenu?.(node.current) ?? []),
		{
			type: 'button',
			icon: <PenSquareIcon />,
			text: 'Rename...',
			onClick: showNameEditor,
		},
		{
			type: 'button',
			icon: <Trash2Icon />,
			text: 'Delete',
			color: 'red',
			onClick: () => onDelete?.(node.current),
		},
	]);

	const { useDraggable } = useDnD<TreeDragData, TreeDropData>();
	const { draggable } = useDraggable(() => node.current);

	return (
		<div
			className={cls.file.block({
				highlighted: open,
				outlined: isContextMenuOpen,
			})}
			onClick={() => onSelect?.(id, path)}
			ref={(el) => {
				draggable.current = el;
				contextMenuTrigger.current = el;
			}}
		>
			<FileTextIcon size={16} className={cls.file.icon()} />
			{isRenaming ? (
				<NameEditorAnchor />
			) : (
				<>
					<span className={cls.file.name()}>{name}</span>
					{renderBadge?.(node.current)}
				</>
			)}
		</div>
	);
};
