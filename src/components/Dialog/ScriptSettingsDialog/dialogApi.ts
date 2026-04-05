import { createElement } from 'react';

import { dialog } from '../dialogApi';
import {
	ScriptSettingsDialog,
	type ScriptSettingsDialogProps,
} from './ScriptSettingsDialog';

export const showScriptSettingsDialog = (props: ScriptSettingsDialogProps) => {
	return dialog.open(
		createElement(ScriptSettingsDialog, { ...props, key: props.path })
	);
};
