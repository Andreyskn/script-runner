import { useEffect, useRef, useState } from 'react';

import EventEmitter from 'eventemitter3';

export abstract class ComponentStore<S extends Record<string, unknown>> {
	private static store: InstanceType<any> | undefined;

	public static init<T extends new (...args: any) => any>(
		this: T,
		...args: ConstructorParameters<T>
	) {
		const staticProps = this as any as typeof ComponentStore & T;
		const instance = new this(...args) as InstanceType<
			typeof ComponentStore
		>;
		staticProps.store = instance;
		const { state, selectors, useSelector } = instance;

		Object.keys(state).forEach((key) => {
			Object.defineProperty(selectors, key, {
				get: function () {
					return useSelector((state: any) => state[key]);
				},
			});
		});

		return instance as InstanceType<T>;
	}

	public static useInit<T extends new (...args: any) => any>(
		this: T,
		...args: ConstructorParameters<T>
	) {
		return useState(() => {
			return (this as any as typeof ComponentStore & T).init(...args);
		})[0];
	}

	public static use<T extends new (...args: any) => any>(this: T) {
		const self = this as any as typeof ComponentStore & T;

		if (self.store) {
			return useState(() => self.store)[0] as InstanceType<T>;
		}

		return self.useInit(...([] as any));
	}

	abstract state: S;

	public selectors: S = {} as S;

	private ee = new EventEmitter<string>();

	protected setState = (update: (state: S) => void) => {
		const paths: string[] = [];
		update(newProxy(this.state, paths));

		for (const p of new Set(paths)) {
			this.ee.emit(p);
		}
	};

	public useSelector = <D, T = D>(
		select: (state: Readonly<S>) => D,
		process?: (selected: D) => T
	) => {
		const paths = useRef<string[]>([]);

		const selectAndProcess = (): any => {
			const data = select(this.state);

			if (process) {
				return process(data);
			} else {
				return data;
			}
		};

		const [data, setData] = useState<T>(() => {
			select(newProxy(this.state, paths.current));
			return selectAndProcess();
		});

		const [cleanup] = useState(() => {
			const pathSet = new Set(paths.current);
			const listener = () => {
				setData(selectAndProcess());
			};

			for (const p of pathSet) {
				this.ee.on(p, listener);
			}

			return () => {
				for (const p of pathSet) {
					this.ee.off(p, listener);
				}
			};
		});

		useEffect(() => cleanup, []);

		return data;
	};
}

const isObject = (value: any) => {
	return !!value && typeof value === 'object' && !Array.isArray(value);
};

const appendPath = (key: string, paths: string[], index = paths.length) => {
	if (!paths[index]) {
		paths[index] = '';
	}
	paths[index] += `${key}/`;
	return index;
};

const newProxy = <T extends Record<string, unknown>>(
	o: T,
	paths: string[],
	pathIndex?: number
) => {
	return new Proxy(o, {
		get(_, key: string) {
			if (Object.hasOwn(o, key)) {
				const index = appendPath(key, paths, pathIndex);

				if (isObject(o[key])) {
					return newProxy(o[key] as any, paths, index);
				}
			}

			const value = Reflect.get(o, key, o);

			if (typeof value === 'function') {
				return value.bind(o);
			}

			return value;
		},
		ownKeys() {
			Object.keys(o).forEach((key) => {
				appendPath(key, paths, pathIndex);
			});

			return Reflect.ownKeys(o);
		},
		set(_target, key: string, newValue) {
			appendPath(key, paths, pathIndex);
			return Reflect.set(o, key, newValue, o);
		},
	});
};
