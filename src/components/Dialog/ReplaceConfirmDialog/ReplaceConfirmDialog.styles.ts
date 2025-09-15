import { bem } from '@andrey/bem';

import styles from './ReplaceConfirmDialog.module.scss';

export const cls = bem(
	styles as {
		'replace-confirm-dialog': string;
		'replace-confirm-dialog__actions': string;
		'replace-confirm-dialog__body': string;
		'replace-confirm-dialog__header': string;
	}
);
