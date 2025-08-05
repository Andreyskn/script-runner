import { useEffect, useLayoutEffect, useState } from 'react';

import { ChevronRightIcon, FolderIcon, FolderOpenIcon } from 'lucide-react';

import { useContextMenu } from '@/components/ContextMenu';
import { useNameEditor } from '@/components/Tree/NameEditor';
import type {
	FolderNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeNodeType,
	TreeNodeWithPath,
} from '@/components/Tree/treeTypes';
import { useDnD } from '@/utils';

import { cls } from './Folder.styles';

export type FolderProps = {
	id: string;
	path: string[];
	name: string;
	children: React.ReactNode;
	open?: boolean;
	renameOnMount?: boolean;
	onToggleOpen: (id: string, isOpen: boolean) => void;
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

	const node: FolderNodeWithPath = {
		id,
		name,
		path,
		type: 'folder',
	};

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor(
		node,
		renameOnMount
	);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{
			icon: 'file-text',
			text: 'New Script',
			onClick: () => {
				setIsOpen(true);
				onCreate('file', node);
			},
		},
		{
			icon: 'folder',
			text: 'New Folder',
			onClick: () => {
				setIsOpen(true);
				onCreate('folder', node);
			},
		},
		{
			icon: 'square-pen',
			text: 'Rename Folder',
			onClick: showNameEditor,
		},
		{
			icon: 'trash-2',
			text: 'Delete Folder',
			color: 'red',
			onClick: () => onDelete?.(node),
		},
	]);

	const { useDraggable, useDropTarget } = useDnD<
		TreeDragData,
		TreeDropData
	>();
	const { draggable } = useDraggable(() => node);
	const { dropTarget, hasDragOver, hasLongHover } = useDropTarget(() => node);

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
