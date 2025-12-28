import { bem } from '@andrey/bem';

import styles from './Search.module.scss';

export const cls = bem(
	styles as {
		dialog: string;
		'dialog--standalone': string;
		option: string;
		option__dir: string;
		option__icon: string;
		option__name: string;
		search: string;
		search__select: string;
	}
);
