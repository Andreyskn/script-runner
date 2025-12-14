/// <reference types="vite/client" />
import type { ElectronAPI } from 'electron/src/preload';

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}

	type Maybe<T> = T | undefined;

	type NonRenderable = false | '' | null | undefined;

	type NonRenderableOptions<T> = {
		[K in keyof T]: undefined extends T[K] ? T[K] | NonRenderable : T[K];
	};

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

	type DeepPartial<T> = {
		[P in keyof T]?: DeepPartial<T[P]>;
	};
}
