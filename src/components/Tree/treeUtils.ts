import type { TreeNode } from './treeTypes';

export type MatchingPathOptions = {
	exact?: boolean;
};

export const isMatchingPath = (
	path: string[],
	targetPath: string[],
	opts?: MatchingPathOptions
) => {
	if (opts?.exact && path.length !== targetPath.length) {
		return false;
	}

	if (path.length > targetPath.length) {
		return false;
	}

	if (!path.length && !targetPath.length) {
		return true;
	}

	return path.every((v, i) => v === targetPath[i]);
};

const collator = new Intl.Collator('en', { numeric: true });

export const sortNodes = <T extends Pick<TreeNode, 'name' | 'type'>>(
	nodes: T[]
) => {
	return nodes.toSorted((a, b) => {
		if (a.type === b.type) {
			return collator.compare(a.name, b.name);
		}

		if (a.type === 'script' && b.type === 'folder') {
			return 1;
		} else {
			return -1;
		}
	});
};
