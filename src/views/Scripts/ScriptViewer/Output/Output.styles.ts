import { bem } from '@andrey/bem';

import styles from './Output.module.scss';

export const cls = bem(
	styles as {
		header: string;
		header__interrupt: string;
		header__loader: string;
		output: string;
		'output-section': string;
		'output-section__content': string;
		'output-section__placeholder': string;
		output__line: string;
		'output__line--error': string;
		'output__line--initial': string;
		'output__line--success': string;
	}
);
