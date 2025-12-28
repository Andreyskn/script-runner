import type { TemporaryNode } from '@/components/Tree/treeTypes';
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
