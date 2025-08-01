import { useContextMenu } from '@/components/ContextMenu';
import type { TreeDragData, TreeDropData } from '@/components/Tree/Tree';
import { FileTextIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useDnD } from 'src/utils/dnd';
import { cls } from './File.styles';

export type FileProps = {
	id: string;
	path: string[];
	name: string;
	open?: boolean;
	onSelect?: (id: string, path: string[]) => void;
};

export const File: React.FC<FileProps> = (props) => {
	const { name, open, onSelect, id, path } = props;

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{ icon: <SquarePenIcon />, text: 'Rename File', onClick: () => {} },
		{ icon: <Trash2Icon />, text: 'Delete File', onClick: () => {} },
	]);

	const { useDraggable } = useDnD<TreeDragData, TreeDropData>();
	const { draggable } = useDraggable<HTMLDivElement>(() => {
		return { id, name, path };
	});

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
			<span className={cls.file.name()}>{name}</span>
		</div>
	);
};
