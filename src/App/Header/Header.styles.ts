import { bem } from '@andrey/bem';

import styles from './Header.module.scss';

export const cls = bem(styles as { header: string; header__title: string });
