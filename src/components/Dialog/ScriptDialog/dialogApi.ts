import { createElement } from 'react';

import { dialog } from '../dialogApi';
import { ScriptDialog, type ScriptDialogProps } from './ScriptDialog';

export const showScriptDialog = (props: ScriptDialogProps) => {
	return dialog.open(
		createElement(ScriptDialog, { key: props.script.id, ...props })
	);
};
