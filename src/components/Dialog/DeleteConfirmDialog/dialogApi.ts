import { createElement } from 'react';

import type { TreeNodeWithPath } from '@/components/Tree';

import { dialog } from '../dialogApi';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export const showDeleteConfirmDialog = (node: TreeNodeWithPath) => {
	return dialog.open<boolean>(createElement(DeleteConfirmDialog, { node }));
};
