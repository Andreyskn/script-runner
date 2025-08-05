import { bem } from '@andrey/bem';

import styles from './Output.module.scss';

export const cls = bem(
	styles as {
		output: string;
		output__content: string;
		output__header: string;
		output__placeholder: string;
	}
);
