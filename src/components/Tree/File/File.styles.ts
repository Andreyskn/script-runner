import { bem } from '@andrey/bem';

import styles from './File.module.scss';

export const cls = bem(
	styles as {
		file: string;
		'file--highlighted': string;
		'file--outlined': string;
		file__icon: string;
		file__name: string;
	}
);
