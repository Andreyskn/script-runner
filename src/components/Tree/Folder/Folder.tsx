import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
	ChevronRightIcon,
	FileTextIcon,
	FolderIcon,
	FolderOpenIcon,
	PenSquareIcon,
	Trash2Icon,
} from 'lucide-react';

import { useContextMenu } from '@/components/ContextMenu';
import type {
	FolderNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeNodeType,
	TreeNodeWithPath,
} from '@/components/Tree/treeTypes';
import { useDnD } from '@/utils';

import { useNameEditor } from '../NameEditor/nameEditorSession';
import { cls } from './Folder.styles';

export type FolderProps = {
	id: number;
	path: string[];
	name: string;
	children: React.ReactNode;
	open?: boolean;
	renameOnMount?: boolean;
	onToggleOpen: (id: FolderProps['id'], isOpen: boolean) => void;
	onCreate: (type: TreeNodeType, parent: FolderNodeWithPath) => void;
	onDelete?: (node: TreeNodeWithPath) => void;
};

export const Folder: React.FC<FolderProps> = (props) => {
	const {
		children,
		name,
		open,
		onToggleOpen,
		id,
		path,
		renameOnMount,
		onCreate,
		onDelete,
	} = props;

	const [isOpen, setIsOpen] = useState(false);

	const node = useRef<FolderNodeWithPath>(null as any);
	node.current = {
		id,
		name,
		path,
		type: 'folder',
	};

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor(
		() => node.current,
		renameOnMount
	);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{
			icon: <FileTextIcon />,
			text: 'New Script',
			onClick: () => {
				setIsOpen(true);
				onCreate('script', node.current);
			},
		},
		{
			icon: <FolderIcon />,
			text: 'New Folder',
			onClick: () => {
				setIsOpen(true);
				onCreate('folder', node.current);
			},
		},
		{
			icon: <PenSquareIcon />,
			text: 'Rename Folder',
			onClick: showNameEditor,
		},
		{
			icon: <Trash2Icon />,
			text: 'Delete Folder',
			color: 'red',
			onClick: () => onDelete?.(node.current),
		},
	]);

	const { useDraggable, useDropTarget } = useDnD<
		TreeDragData,
		TreeDropData
	>();
	const { draggable } = useDraggable(() => node.current);
	const { dropTarget, hasDragOver, hasLongHover } = useDropTarget(
		() => node.current
	);

	useLayoutEffect(() => {
		if (open) {
			setIsOpen(true);
		}
	}, [open]);

	useEffect(() => {
		onToggleOpen(id, isOpen);
	}, [isOpen]);

	useLayoutEffect(() => {
		if (hasLongHover) {
			setIsOpen(true);
		}
	}, [hasLongHover]);

	return (
		<div
			className={cls.folder.block({
				highlighted: hasDragOver,
			})}
			ref={dropTarget}
		>
			<div
				className={cls.folder.heading({
					outlined: isContextMenuOpen,
				})}
				onClick={() => setIsOpen(!isOpen)}
				ref={(el) => {
					draggable.current = el;
					contextMenuTrigger.current = el;
				}}
			>
				<ChevronRightIcon
					size={16}
					className={cls.folder.chevron({ open: isOpen })}
				/>
				{isOpen ? (
					<FolderOpenIcon size={16} className={cls.folder.icon()} />
				) : (
					<FolderIcon size={16} className={cls.folder.icon()} />
				)}
				{isRenaming ? (
					<NameEditorAnchor />
				) : (
					<span className={cls.folder.name()}>{name}</span>
				)}
			</div>
			<div className={cls.folder.content({ hidden: !isOpen })}>
				{children}
			</div>
		</div>
	);
};
