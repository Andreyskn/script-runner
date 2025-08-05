import { useSyncExternalStore } from 'react';

import type { TemporaryNode } from '@/components/Tree/treeTypes';
import { isMatchingPath } from '@/components/Tree/treeUtils';
import { ComponentStore } from '@/utils';

type TreeEvent = 'tmp-node';

class TreeStore extends ComponentStore<TreeEvent> {
	tmpNode: TemporaryNode | null = null;

	setTmpNode = (node: TemporaryNode | null) => {
		this.tmpNode = node;
		this.emit('tmp-node');
	};
}

export const treeStore = new TreeStore();

export const useTreeStore = (path: string[]) => {
	const tmpNode = useSyncExternalStore(
		treeStore.subscribe('tmp-node'),
		() => {
			const { tmpNode } = treeStore;

			if (
				tmpNode &&
				isMatchingPath(path, tmpNode.parent.path, { exact: true })
			) {
				return tmpNode.node;
			}
		}
	);

	return { tmpNode };
};
