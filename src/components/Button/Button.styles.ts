import { bem } from '@andrey/bem';

import styles from './Button.module.scss';

export const cls = bem(
	styles as {
		button: string;
		'button--align-left': string;
		'button--align-right': string;
		'button--borderless': string;
		'button--color-green': string;
		'button--color-red': string;
		'button--fill-green': string;
		'button--fill-red': string;
		'button--large': string;
		'button--minimal': string;
		'button--round': string;
		'button--small': string;
		'button--stretch': string;
		'button--vertical': string;
		button__badge: string;
		button__icon: string;
		button__loader: string;
		button__text: string;
	}
);
