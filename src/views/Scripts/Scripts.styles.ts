import { bem } from '@andrey/bem';
import styles from './Scripts.module.scss';

export const cls = bem(
	styles as {
		scripts: string;
		'scripts__tree-section': string;
		'scripts__tree-section-content': string;
	}
);
