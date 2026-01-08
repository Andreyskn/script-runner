import { bem } from '@andrey/bem';

import styles from './ScriptDialog.module.scss';

export const cls = bem(
	styles as {
		'script-dialog': string;
		'script-dialog__accordion-btn': string;
		'script-dialog__accordion-btn--open': string;
		'script-dialog__accordion-btn--output': string;
		'script-dialog__accordion-content': string;
		'script-dialog__actions': string;
		'script-dialog__close': string;
		'script-dialog__name': string;
		'script-dialog__output-btn-text': string;
		'script-dialog__path': string;
		'status-badge': string;
		'status-badge--fail': string;
		'status-badge--running': string;
		'status-badge--success': string;
	}
);
