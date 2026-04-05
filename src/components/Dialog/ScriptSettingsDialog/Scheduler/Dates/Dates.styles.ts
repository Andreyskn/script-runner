import { bem } from '@andrey/bem';

import styles from './Dates.module.scss';

export const cls = bem(
	styles as {
		dates: string;
		'dates__date-input': string;
		'dates__scheduled-run': string;
		dates__title: string;
	}
);
