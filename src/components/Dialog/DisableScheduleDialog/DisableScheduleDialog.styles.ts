import { bem } from '@andrey/bem';

import styles from './DisableScheduleDialog.module.scss';

export const cls = bem(
	styles as {
		'disable-schedule-dialog': string;
		'disable-schedule-dialog__actions': string;
		'disable-schedule-dialog__body': string;
		'disable-schedule-dialog__header': string;
	}
);
