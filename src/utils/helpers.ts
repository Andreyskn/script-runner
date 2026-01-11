export const sleep = async (ms: number) => {
	return new Promise((r) => setTimeout(r, ms));
};

export const getFilename = (path: string) => {
	return path.slice(path.lastIndexOf('/') + 1);
};

// TODO: use instead of getFilename()
export const parsePath = (path: string) => {
	const lastSlashIndex = path.lastIndexOf('/');
	const base = path.slice(lastSlashIndex + 1);

	const result = {
		...parseBase(base),
		base,
		dir: '',
	};

	if (path !== base) {
		result.dir = path.slice(0, lastSlashIndex);
	}

	return result;
};

export const parseBase = (base: string) => {
	const result = {
		name: '',
		ext: '',
	};
	const dotIndex = base.lastIndexOf('.');

	if (dotIndex > 0) {
		result.ext = base.slice(dotIndex);
	}

	result.name = base.slice(0, -result.ext.length || undefined);

	return result;
};
