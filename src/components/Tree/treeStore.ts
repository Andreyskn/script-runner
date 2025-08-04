import type { TemporaryNode } from '@/components/Tree/treeTypes';
import { isMatchingPath } from '@/components/Tree/treeUtils';
import EventEmitter from 'eventemitter3';
import { useSyncExternalStore } from 'react';

type TreeEvent = 'tmp-node';

class TreeStore {
	#ee = new EventEmitter<TreeEvent>();

	tmpNode: TemporaryNode | null = null;

	setTmpNode = (node: TemporaryNode | null) => {
		this.tmpNode = node;
		this.#ee.emit('tmp-node');
	};

	subscribe = (listener: () => void) => {
		this.#ee.on('tmp-node', listener);

		return () => {
			this.#ee.off('tmp-node', listener);
		};
	};
}

export const treeStore = new TreeStore();

export const useTreeStore = (path: string[]) => {
	const tmpNode = useSyncExternalStore(treeStore.subscribe, () => {
		const { tmpNode } = treeStore;

		if (
			tmpNode &&
			isMatchingPath(path, tmpNode.parent.path, { exact: true })
		) {
			return tmpNode.node;
		}
	});

	return { tmpNode };
};
