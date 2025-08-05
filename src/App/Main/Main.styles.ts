import { bem } from '@andrey/bem';

import styles from './Main.module.scss';

export const cls = bem(styles as { main: string });
