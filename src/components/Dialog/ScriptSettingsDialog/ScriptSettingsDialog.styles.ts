import { bem } from '@andrey/bem';

import styles from './ScriptSettingsDialog.module.scss';

export const cls = bem(
	styles as {
		autorun: string;
		'autorun__autorun-checkbox': string;
		autorun__control: string;
		autorun__subtitle: string;
		autorun__title: string;
		dialog: string;
		dialog__actions: string;
		dialog__close: string;
		dialog__info: string;
		'dialog__info-key': string;
		'dialog__info-value': string;
		dialog__title: string;
		setting: string;
		setting__content: string;
		setting__title: string;
	}
);
