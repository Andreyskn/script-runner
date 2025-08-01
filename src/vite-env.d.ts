/// <reference types="vite/client" />

declare global {
	type Maybe<T> = T | undefined;

	type Replace<
		T extends Record<any, any>,
		R extends Partial<Record<keyof T, unknown>>,
	> = OmitType<T, keyof R> & R;

	type ValueOf<T> = T[keyof T];

	type OmitType<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

	type ExcludeType<T, U extends T> = T extends U ? never : T;

	type ExtractType<T, U extends T> = T extends U ? T : never;

	type AnyObject = Record<string | number, any>;

	type AnyFunction = (...args: any[]) => any;
}

export {};
