export type DialogAPI = {
	open: <T = undefined>(content: React.ReactNode) => Promise<T | undefined>;
	close: () => void;
	resolve: <T>(data: T) => void;
};

export const dialog: DialogAPI = {
	open: () => null as any,
	close: () => null as any,
	resolve: () => null as any,
};
