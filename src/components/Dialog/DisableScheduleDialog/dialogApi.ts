import { createElement } from 'react';

import { dialog } from '../dialogApi';
import {
	DisableScheduleDialog,
	type DisableScheduleDialogProps,
} from './DisableScheduleDialog';

export const showDisableScheduleDialog = (
	props: DisableScheduleDialogProps
) => {
	return dialog.open<boolean>(createElement(DisableScheduleDialog, props));
};
