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

export const getUniqueId = (): string => {
	const random = Math.random().toString(36).slice(2, 6);
	const timestamp = Date.now().toString(36);

	return `__TREE_ID__${random.repeat(3)}__${timestamp}__`;
};
