import { FileTextIcon, PenSquareIcon, Trash2Icon } from 'lucide-react';

import { useContextMenu } from '@/components/ContextMenu';
import { useNameEditor } from '@/components/Tree/NameEditor';
import type {
	FileNodeWithPath,
	TreeDragData,
	TreeDropData,
	TreeNodeWithPath,
} from '@/components/Tree/treeTypes';
import { useDnD } from '@/utils';

import { cls } from './File.styles';

export type FileProps = {
	id: number;
	path: string[];
	name: string;
	open?: boolean;
	renameOnMount?: boolean;
	onSelect?: (id: FileProps['id'], path: string[]) => void;
	onDelete?: (node: TreeNodeWithPath) => void;
};

export const File: React.FC<FileProps> = (props) => {
	const { name, open, onSelect, id, path, renameOnMount, onDelete } = props;

	const node: FileNodeWithPath = {
		id,
		name,
		path,
		type: 'script',
	};

	const { NameEditorAnchor, isRenaming, showNameEditor } = useNameEditor(
		node,
		renameOnMount
	);

	const { contextMenuTrigger, isContextMenuOpen } = useContextMenu(() => [
		{
			icon: <PenSquareIcon />,
			text: 'Rename Script',
			onClick: () => showNameEditor.current(),
		},
		{
			icon: <Trash2Icon />,
			text: 'Delete Script',
			color: 'red',
			onClick: () => onDelete?.(node),
		},
	]);

	const { useDraggable } = useDnD<TreeDragData, TreeDropData>();
	const { draggable } = useDraggable(() => node);

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
