import { Button } from '@/components/Button';

import { dialog } from '../dialogApi';
import { cls } from './DisableScheduleDialog.styles';

export type DisableScheduleDialogProps = {
	name: string;
};

export const DisableScheduleDialog: React.FC<DisableScheduleDialogProps> = (
	props
) => {
	const { name } = props;

	return (
		<div className={cls.disableScheduleDialog.block()}>
			<div className={cls.disableScheduleDialog.header()}>
				Disable Schedule?
			</div>
			<div className={cls.disableScheduleDialog.body()}>
				Are you sure you want to disable the active schedule for{' '}
				<b>{name}</b>?
			</div>
			<div className={cls.disableScheduleDialog.actions()}>
				<Button text='Cancel' size='large' onClick={dialog.close} />
				<Button
					text='Disable Schedule'
					fill='red'
					size='large'
					onClick={() => dialog.resolve(true)}
				/>
			</div>
		</div>
	);
};
