import { SettingsIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/Button';

import { dialog } from '../dialogApi';
import { cls } from './ScriptSettingsDialog.styles';

export type ScriptSettingsDialogProps = {};

export const ScriptSettingsDialog: React.FC<ScriptSettingsDialogProps> = (
	props
) => {
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
				Script Settings
			</div>
			<div className={cls.dialog.info()}>
				<div className={cls.dialog.infoKey()}>Path</div>
				<div className={cls.dialog.infoValue()}>
					utilities/cleanup.sh
				</div>
			</div>

			<div className={cls.setting.block()}>
				<label
					htmlFor='autorun-setting'
					className={cls.setting.title()}
				>
					Autorun on Startup
				</label>
				<div className={cls.setting.subtitle()}>
					Script will automatically run when the app starts
				</div>
				<div className={cls.setting.control()}>
					<input
						type='checkbox'
						id='autorun-setting'
						name='autorun'
						onChange={(e) => {
							console.log(e.target.checked);
						}}
						className={cls.setting.autorunCheckbox()}
					/>
				</div>
			</div>

			<div className={cls.dialog.actions()}>
				<Button text='Close' size='large' onClick={dialog.close} />
			</div>
		</div>
	);
};
