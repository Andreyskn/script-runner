import { bem } from '@andrey/bem';

import styles from './Folder.module.scss';

export const cls = bem(
	styles as {
		folder: string;
		'folder--highlighted': string;
		folder__chevron: string;
		'folder__chevron--open': string;
		folder__content: string;
		'folder__content--hidden': string;
		folder__heading: string;
		'folder__heading--outlined': string;
		folder__icon: string;
		folder__name: string;
	}
);
