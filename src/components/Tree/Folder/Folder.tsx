import { useContextMenu } from '@/components/ContextMenu';
import type { TreeDragData, TreeDropData } from '@/components/Tree/Tree';
import {
	ChevronRightIcon,
	FileTextIcon,
	FolderIcon,
	FolderOpenIcon,
	SquarePenIcon,
	Trash2Icon,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useDnD } from 'src/utils/dnd';
import { cls } from './Folder.styles';

export type FolderProps = {
	id: string;
	path: string[];
	name: string;
	children: React.ReactNode;
	open?: boolean;
	onOpenChange: (id: string, isOpen: boolean) => void;
};

export const Folder: React.FC<FolderProps> = (props) => {
	const { children, name, open, onOpenChange, id, path } = props;

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{ icon: <FileTextIcon />, text: 'New Script', onClick: () => {} },
		{ icon: <FolderIcon />, text: 'New Folder', onClick: () => {} },
		{ icon: <SquarePenIcon />, text: 'Rename Folder', onClick: () => {} },
		{ icon: <Trash2Icon />, text: 'Delete Folder', onClick: () => {} },
	]);

	const { useDraggable, useDropTarget } = useDnD<
		TreeDragData,
		TreeDropData
	>();
	const { draggable } = useDraggable<HTMLDivElement>(() => {
		return { id, name, path };
	});
	const { dropTarget, hasDragOver, hasLongHover } =
		useDropTarget<HTMLDivElement>(() => {
			return { id, name, path };
		});

	const [isOpen, setIsOpen] = useState(false);

	useLayoutEffect(() => {
		if (open) {
			setIsOpen(true);
		}
	}, [open]);

	useEffect(() => {
		onOpenChange(id, isOpen);
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
				<span className={cls.folder.name()}>{name}</span>
			</div>
			<div className={cls.folder.content({ hidden: !isOpen })}>
				{children}
			</div>
		</div>
	);
};
