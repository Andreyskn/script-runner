import { bem } from '@andrey/bem';

import styles from './Output.module.scss';

export const cls = bem(
	styles as {
		header: string;
		'header__interrupt-button': string;
		header__loader: string;
		output: string;
		output__content: string;
		output__line: string;
		'output__line--error': string;
		'output__line--initial': string;
		'output__line--success': string;
		output__placeholder: string;
	}
);
