import { bem } from '@andrey/bem';

import styles from './Select.module.scss';

export const cls = bem(
	styles as {
		select: string;
		select__chevron: string;
		'select__option-content': string;
		select__picker: string;
	}
);
