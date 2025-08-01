import { bem } from '@andrey/bem';
import styles from './Section.module.scss';

export const cls = bem(
	styles as {
		section: string;
		'section--card': string;
		section__content: string;
		'section__content--no-padding': string;
		section__header: string;
	}
);
