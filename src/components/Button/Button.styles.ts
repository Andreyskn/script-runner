import { bem } from '@andrey/bem';

import styles from './Button.module.scss';

export const cls = bem(
	styles as {
		scripts: string;
		'scripts__tree-section': string;
		'scripts__tree-section-content': string;
	}
);
