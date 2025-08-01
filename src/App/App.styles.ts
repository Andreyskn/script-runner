import { bem } from '@andrey/bem';
import styles from './App.module.scss';

export const cls = bem(
	styles as {
		app: string;
		app__content: string;
		app__main: string;
		app__sidebar: string;
	}
);
