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
