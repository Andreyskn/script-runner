import { bem } from '@andrey/bem';

import styles from './ScriptViewer.module.scss';

export const cls = bem(
	styles as {
		header: string;
		header__actions: string;
		header__icon: string;
		header__info: string;
		header__subtitle: string;
		header__title: string;
		'script-viewer': string;
		'script-viewer__content': string;
	}
);
