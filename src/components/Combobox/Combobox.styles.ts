import { bem } from '@andrey/bem';

import styles from './Combobox.module.scss';

export const cls = bem(
	styles as {
		combobox: string;
		combobox__input: string;
		combobox__select: string;
	}
);
