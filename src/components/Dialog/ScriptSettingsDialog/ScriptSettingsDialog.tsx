import { ClockIcon, SettingsIcon, XIcon, ZapIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { dialog } from '../dialogApi';
import { Scheduler } from './Scheduler';
import { cls } from './ScriptSettingsDialog.styles';

export type ScriptSettingsDialogProps = {
	script: ScriptStore;
	path: string;
};

export const ScriptSettingsDialog: React.FC<ScriptSettingsDialogProps> = (
	props
) => {
	const {
		script: {
			id,
			setAutorun,
			state: { autorun },
		},
		path,
	} = props;

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
				<div className={cls.dialog.infoValue()}>{path}</div>
			</div>

			<div className={cls.setting.block()}>
				<div className={cls.setting.title()}>
					<ZapIcon size={16} /> Autorun
				</div>
				<div className={cls.setting.content()}>
					<div className={cls.autorun.block()}>
						<label
							htmlFor='autorun-setting'
							className={cls.autorun.title()}
						>
							Run on Startup
						</label>
						<div className={cls.autorun.subtitle()}>
							Script will automatically run when the app starts
						</div>
						<div className={cls.autorun.control()}>
							<input
								type='checkbox'
								id='autorun-setting'
								name='autorun'
								onChange={(e) =>
									setAutorun(id, e.target.checked)
								}
								className={cls.autorun.autorunCheckbox()}
								defaultChecked={autorun}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className={cls.setting.block()}>
				<div className={cls.setting.title()}>
					<ClockIcon size={16} /> Schedule
				</div>
				<div className={cls.setting.content()}>
					<Scheduler />
				</div>
			</div>

			<div className={cls.dialog.actions()}>
				<Button text='Close' size='large' onClick={dialog.close} />
			</div>
		</div>
	);
};
