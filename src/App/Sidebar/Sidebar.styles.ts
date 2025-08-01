import { bem } from '@andrey/bem';
import styles from './Sidebar.module.scss';

export const cls = bem(styles as { sidebar: string; sidebar__nav: string });
