import { SettingsIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/Button';

import { dialog } from '../dialogApi';
import { cls } from './AppSettingsDialog.styles';

export type AppSettingsDialogProps = {};

export const AppSettingsDialog: React.FC<AppSettingsDialogProps> = (props) => {
	const {} = props;

	return (
		<div className={cls.dialog.block()}>
			<Button
				icon={<XIcon />}
				borderless
				size='small'
				round
				className={cls.dialog.close()}
				onClick={dialog.close}
			/>
			<div className={cls.dialog.title()}>
				<SettingsIcon size={20} />
				App Settings
			</div>
		</div>
	);
};
