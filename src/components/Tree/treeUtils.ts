import type { File } from '@/views/Scripts/stores/filesStore';

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

type StringValueKey<T extends Record<string, unknown>> = ValueOf<{
	[K in keyof T]: T[K] extends string ? K : never;
}>;

const collator = new Intl.Collator('en', { numeric: true });

export const sortNodes = <T extends TreeNode | File>(
	nodes: T[],
	compareBy: StringValueKey<T>
) => {
	return nodes.toSorted((a, b) => {
		if (a.type === b.type) {
			return collator.compare(
				a[compareBy] as string,
				b[compareBy] as string
			);
		}

		if (a.type === 'script' && b.type === 'folder') {
			return 1;
		} else {
			return -1;
		}
	});
};
