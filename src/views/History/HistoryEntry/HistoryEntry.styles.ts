import { bem } from '@andrey/bem';

import styles from './HistoryEntry.module.scss';

export const cls = bem(
	styles as {
		actions: string;
		'history-entry': string;
		'history-entry__main': string;
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
		'title__indicator--success': string;
		title__name: string;
		title__path: string;
	}
);
