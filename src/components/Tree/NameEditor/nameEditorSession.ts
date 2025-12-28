import { useLayoutEffect } from 'react';

import { ComponentStore } from '@/utils';

import type { TreeNodeWithPath } from '../treeTypes';
import { NameEditorAnchor } from './NameEditorAnchor';

type SessionStatus = 'inactive' | 'active' | 'confirmed' | 'cancelled';

type State = {
	activeNode: TreeNodeWithPath | null;
	status: SessionStatus;
};

class NameEditorSession extends ComponentStore<State> {
	state: State = {
		activeNode: null,
		status: 'inactive',
	};

	toggle = (node: TreeNodeWithPath | null) => {
		this.setState((state) => {
			if (node) {
				state.status = 'active';
			} else {
				state.status = 'inactive';
			}

			state.activeNode = node;
		});
	};

	setStatus = (status: SessionStatus) => {
		this.setState((state) => {
			state.status = status;
		});
	};
}

export const nameEditorSession = new NameEditorSession();

export const useNameEditor = (
	getNode: () => TreeNodeWithPath,
	renameOnMount?: boolean
) => {
	const showNameEditor = () => {
		nameEditorSession.toggle(getNode());
	};

	useLayoutEffect(() => {
		if (renameOnMount) {
			showNameEditor();
		}
	}, []);

	const isRenaming = nameEditorSession.useSelector(
		(state) => state.activeNode,
		(activeNode) => activeNode?.id === getNode().id
	);

	return { showNameEditor, isRenaming, NameEditorAnchor };
};
