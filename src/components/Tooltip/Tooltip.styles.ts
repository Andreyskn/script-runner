import { bem } from '@andrey/bem';

import styles from './Tooltip.module.scss';

export const cls = bem(
	styles as { tooltip: string; tooltip__arrow: string; wrapper: string }
);
