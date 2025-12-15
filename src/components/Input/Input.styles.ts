import { bem } from '@andrey/bem';

import styles from './Input.module.scss';

export const cls = bem(
	styles as { input: string; 'input--with-icon': string; wrapper: string }
);
