import { bem } from '@andrey/bem';

import styles from './Search.module.scss';

export const cls = bem(
	styles as {
		dialog: string;
		option: string;
		'option--compact': string;
		option__dir: string;
		option__icon: string;
		option__name: string;
		option__play: string;
		search: string;
		search__select: string;
	}
);
