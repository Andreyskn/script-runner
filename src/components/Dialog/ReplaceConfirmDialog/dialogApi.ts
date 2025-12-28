import { createElement } from 'react';

import { dialog } from '../dialogApi';
import {
	ReplaceConfirmDialog,
	type ReplaceConfirmDialogProps,
} from './ReplaceConfirmDialog';

export const showReplaceConfirmDialog = (props: ReplaceConfirmDialogProps) => {
	return dialog.open<boolean>(createElement(ReplaceConfirmDialog, props));
};
