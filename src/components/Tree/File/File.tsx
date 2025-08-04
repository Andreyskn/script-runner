import { useContextMenu } from '@/components/ContextMenu';
import { useNameEditor } from '@/components/Tree/NameEditor';
import type { TreeDragData, TreeDropData } from '@/components/Tree/Tree';
import { FileTextIcon } from 'lucide-react';
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

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor({
		id,
		name,
		path,
		type: 'file',
	});

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{ icon: 'square-pen', text: 'Rename Script', onClick: showNameEditor },
		{
			icon: 'trash-2',
			text: 'Delete Script',
			color: 'red',
			onClick: () => {},
		},
	]);

	const { useDraggable } = useDnD<TreeDragData, TreeDropData>();
	const { draggable } = useDraggable<HTMLDivElement>(() => {
		return { id, name, path, type: 'file' };
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
			{isRenaming ? (
				<NameEditorAnchor />
			) : (
				<span className={cls.file.name()}>{name}</span>
			)}
		</div>
	);
};
