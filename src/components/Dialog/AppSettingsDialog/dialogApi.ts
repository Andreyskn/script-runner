import { createElement } from 'react';

import { dialog } from '../dialogApi';
import {
	AppSettingsDialog,
	type AppSettingsDialogProps,
} from './AppSettingsDialog';

export const showAppSettingsDialog = (props: AppSettingsDialogProps) => {
	return dialog.open(createElement(AppSettingsDialog, props));
};
