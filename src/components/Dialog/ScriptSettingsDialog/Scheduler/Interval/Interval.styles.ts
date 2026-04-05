import { bem } from '@andrey/bem';

import styles from './Interval.module.scss';

export const cls = bem(
	styles as {
		interval: string;
		'interval__btn-row': string;
		interval__duration: string;
		'interval__input-wrap': string;
		'interval__save-btn': string;
		interval__title: string;
	}
);
