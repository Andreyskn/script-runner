import { useContextMenu } from '@/components/ContextMenu';
import { useNameEditor } from '@/components/Tree/NameEditor';
import type {
	FileNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeNodeWithPath,
} from '@/components/Tree/Tree';
import { FileTextIcon } from 'lucide-react';
import { useDnD } from 'src/utils/dnd';
import { cls } from './File.styles';

export type FileProps = {
	id: string;
	path: string[];
	name: string;
	open?: boolean;
	renameOnMount?: boolean;
	onSelect?: (id: string, path: string[]) => void;
	onDelete?: (node: TreeNodeWithPath) => void;
};

export const File: React.FC<FileProps> = (props) => {
	const { name, open, onSelect, id, path, renameOnMount, onDelete } = props;

	const node: FileNodeWithPath = {
		id,
		name,
		path,
		type: 'file',
	};

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor(
		node,
		renameOnMount
	);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{ icon: 'square-pen', text: 'Rename Script', onClick: showNameEditor },
		{
			icon: 'trash-2',
			text: 'Delete Script',
			color: 'red',
			onClick: () => onDelete?.(node),
		},
	]);

	const { useDraggable } = useDnD<TreeDragData, TreeDropData>();
	const { draggable } = useDraggable<HTMLDivElement>(() => node);

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
