import { bem } from '@andrey/bem';

import styles from './ScriptBadge.module.scss';

export const cls = bem(
	styles as { 'script-badge': string; 'script-badge--schedule': string }
);
