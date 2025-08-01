import { bem } from '@andrey/bem';
import styles from './Tree.module.scss';

export const cls = bem(
	styles as {
		tree: string;
		'tree--highlighted': string;
		'tree--outlined': string;
	}
);
