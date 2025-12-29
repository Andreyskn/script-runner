export const sleep = async (ms: number) => {
	return new Promise((r) => setTimeout(r, ms));
};

export const getFilename = (path: string) => {
	return path.slice(path.lastIndexOf('/') + 1);
};
