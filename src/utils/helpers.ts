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

export const omit = <T extends Record<any, any>, K extends (keyof T)[]>(
	obj: T,
	...keys: K
): OmitType<T, K[number]> => {
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => !keys.includes(k))
	) as any;
};

export const pick = <T extends Record<any, any>, K extends (keyof T)[]>(
	obj: T,
	...keys: K
): Pick<T, K[number]> => {
	return Object.fromEntries(
		Object.entries(obj).filter(([k]) => keys.includes(k))
	) as any;
};
