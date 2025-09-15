import { bem } from '@andrey/bem';

import styles from './DeleteConfirmDialog.module.scss';

export const cls = bem(
	styles as {
		'delete-confirm-dialog': string;
		'delete-confirm-dialog__actions': string;
		'delete-confirm-dialog__body': string;
		'delete-confirm-dialog__header': string;
	}
);
