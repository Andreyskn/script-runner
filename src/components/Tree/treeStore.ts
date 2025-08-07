import type { TemporaryNode } from '@/components/Tree/treeTypes';
import { isMatchingPath } from '@/components/Tree/treeUtils';
import { ComponentStore } from '@/utils';

type State = {
	tmpNode: TemporaryNode | null;
};

class TreeStore extends ComponentStore<State> {
	state: State = {
		tmpNode: null,
	};

	setTmpNode = (node: TemporaryNode | null) => {
		this.setState((state) => {
			state.tmpNode = node;
		});
	};
}

export const treeStore = new TreeStore();

export const useTreeStore = (path: string[]) => {
	const tmpNode = treeStore.useSelector(
		(state) => state.tmpNode,
		(tmpNode) => {
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
