import { bem } from '@andrey/bem';

import styles from './Scheduler.module.scss';

export const cls = bem(
	styles as { scheduler: string; scheduler__content: string }
);
