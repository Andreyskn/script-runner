import { bem } from '@andrey/bem';

import styles from './HistoryEntry.module.scss';

export const cls = bem(
	styles as {
		'history-entry': string;
		'history-entry--last-unseen': string;
		'history-entry__main': string;
		'history-entry__main--active': string;
		'history-entry__output': string;
		'history-entry__output-wrapper': string;
		info: string;
		info__duration: string;
		info__time: string;
		'output-toggle': string;
		'output-toggle--open': string;
		status: string;
		'status--fail': string;
		'status--success': string;
		title: string;
		title__indicator: string;
		'title__indicator--fail': string;
		'title__indicator--loader': string;
		'title__indicator--success': string;
		title__name: string;
		title__path: string;
	}
);
