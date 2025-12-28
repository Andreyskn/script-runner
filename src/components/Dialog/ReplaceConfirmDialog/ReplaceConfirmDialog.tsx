import { TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import type { TreeNode } from '@/components/Tree';

import { dialog } from '../dialogApi';
import { cls } from './ReplaceConfirmDialog.styles';

export type ReplaceConfirmDialogProps = {
	type: TreeNode['type'];
	name: string;
};

export const ReplaceConfirmDialog: React.FC<ReplaceConfirmDialogProps> = (
	props
) => {
	const { name, type } = props;
	const isScript = type === 'script';

	return (
		<div className={cls.replaceConfirmDialog.block()}>
			<div className={cls.replaceConfirmDialog.header()}>
				<TriangleAlertIcon size={20} />
				{isScript ? 'Replace Script' : 'Replace Folder'}
			</div>
			<div className={cls.replaceConfirmDialog.body()}>
				A {isScript ? 'script' : 'folder'} with the name{' '}
				<strong>{name}</strong> already exists in the destination
				folder. Do you want to replace it? This action cannot be undone.
			</div>
			<div className={cls.replaceConfirmDialog.actions()}>
				<Button text='Cancel' size='large' onClick={dialog.close} />
				<Button
					text='Replace'
					fill='red'
					size='large'
					onClick={() => dialog.resolve(true)}
				/>
			</div>
		</div>
	);
};
