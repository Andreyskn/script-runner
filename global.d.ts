export {};

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

	type DeepPartial<T> = {
		[P in keyof T]?: DeepPartial<T[P]>;
	};

	type Combine<T> = { [K in keyof _Combine<T>]: _Combine<T>[K] };

	type SymmetricDiff<
		A extends Record<PropertyKey, any>,
		B extends Record<PropertyKey, any>,
	> = {
		[K in SymmetricDiffKeys<A, B>]: K extends keyof A
			? A[K]
			: K extends keyof B
				? B[K]
				: never;
	};
}

type _Combine<
	T,
	K extends PropertyKey = T extends unknown ? keyof T : never,
> = T extends unknown ? T & Partial<Record<Exclude<K, keyof T>, never>> : never;

type SymmetricDiffKeys<
	A extends Record<PropertyKey, any>,
	B extends Record<PropertyKey, any>,
> = Exclude<keyof A | keyof B, keyof A & keyof B>;
