import { bem } from '@andrey/bem';

import styles from './AppSettingsDialog.module.scss';

export const cls = bem(
	styles as { dialog: string; dialog__close: string; dialog__title: string }
);
