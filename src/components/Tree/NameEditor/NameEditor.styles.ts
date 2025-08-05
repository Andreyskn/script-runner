import { bem } from '@andrey/bem';

import styles from './NameEditor.module.scss';

export const cls = bem(
	styles as {
		anchor: string;
		editor: string;
		editor__error: string;
		editor__input: string;
		'editor__input--error': string;
		'editor__input--folder': string;
	}
);
