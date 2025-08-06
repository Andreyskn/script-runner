import { bem } from '@andrey/bem';

import styles from './ScriptContent.module.scss';

export const cls = bem(
	styles as {
		'script-content': string;
		'script-content__header': string;
		'script-content__text': string;
	}
);
