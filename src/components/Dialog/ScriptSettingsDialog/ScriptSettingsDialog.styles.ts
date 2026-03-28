import { bem } from '@andrey/bem';

import styles from './ScriptSettingsDialog.module.scss';

export const cls = bem(
	styles as {
		dialog: string;
		dialog__actions: string;
		dialog__close: string;
		dialog__info: string;
		'dialog__info-key': string;
		'dialog__info-value': string;
		dialog__title: string;
		setting: string;
		'setting__autorun-checkbox': string;
		setting__control: string;
		setting__subtitle: string;
		setting__title: string;
	}
);
