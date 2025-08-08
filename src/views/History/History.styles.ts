import { bem } from '@andrey/bem';

import styles from './History.module.scss';

export const cls = bem(
	styles as {
		header: string;
		header__counter: string;
		header__subtitle: string;
		header__title: string;
		history: string;
		history__content: string;
		placeholder: string;
		placeholder__subtitle: string;
		placeholder__title: string;
	}
);
