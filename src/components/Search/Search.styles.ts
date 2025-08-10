import { bem } from '@andrey/bem';

import styles from './Search.module.scss';

export const cls = bem(
	styles as { dialog: string; search: string; search__select: string }
);
