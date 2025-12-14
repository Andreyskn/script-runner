export const myService = {
	hello(name: string) {
		return `Hello ${name}!`;
	},
};

export type MyService = typeof myService;
