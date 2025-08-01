import { bem } from '@andrey/bem';
import styles from './ContextMenu.module.scss';

export const cls = bem(styles as { anchor: string; menu: string });
