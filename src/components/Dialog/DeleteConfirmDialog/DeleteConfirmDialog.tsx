import { TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { dialog } from '@/components/Dialog/Dialog';
import type { TreeNodeWithPath } from '@/components/Tree';

import { cls } from './DeleteConfirmDialog.styles';

export const showDeleteConfirmDialog = (node: TreeNodeWithPath) => {
	return dialog.open<boolean>(<DeleteConfirmDialog node={node} />);
};

type DeleteConfirmDialogProps = {
	node: TreeNodeWithPath;
};

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = (props) => {
	const { node } = props;
	const isScript = node.type === 'file';

	return (
		<div className={cls.deleteConfirmDialog.block()}>
			<div className={cls.deleteConfirmDialog.header()}>
				<TriangleAlertIcon size={20} />
				{isScript ? 'Delete Script' : 'Delete Folder'}
			</div>
			<div className={cls.deleteConfirmDialog.body()}>
				{isScript ? (
					<>
						Are you sure you want to delete the script{' '}
						<strong>{node.name}</strong>? This action cannot be
						undone.
					</>
				) : (
					<>
						Are you sure you want to delete the folder{' '}
						<strong>{node.name}</strong>? This will permanently
						delete the folder and all scripts inside it. This action
						cannot be undone.
					</>
				)}
			</div>
			<div className={cls.deleteConfirmDialog.actions()}>
				<Button text='Cancel' size='large' onClick={dialog.close} />
				<Button
					text={isScript ? 'Delete Script' : 'Delete Folder'}
					icon='trash-2'
					fill='red'
					size='large'
					onClick={() => dialog.resolve(true)}
				/>
			</div>
		</div>
	);
};
