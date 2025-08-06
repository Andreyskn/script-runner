import { useEffect, useRef, useState } from 'react';

import EventEmitter from 'eventemitter3';

export abstract class ComponentStore<S extends Record<string, unknown>> {
	abstract state: S;

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

		const selectAndProcess = () => {
			const data = select(this.state);
			return (process?.(data) ?? data) as any;
		};

		const [data, setData] = useState<T>(() => {
			select(newProxy(this.state, paths.current));
			return selectAndProcess();
		});

		useEffect(() => {
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
		}, []);

		return data;
	};
}

export const getStoreInitHook = <S extends new () => any>(Store: S) => {
	let store: { current: InstanceType<S> } = {
		get current() {
			throw new Error(`${Store.name} is not initialized`);
			return null as any;
		},
	};

	const useInitStore = () => {
		store = { current: new Store() };
		useState(store);
	};

	const getStore = () => {
		return store.current;
	};

	return { useInitStore, getStore };
};

function isObject(value: any) {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

const appendPath = (key: string, paths: string[], index = paths.length) => {
	if (!paths[index]) {
		paths[index] = '/';
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
			return Reflect.get(o, key);
		},
		ownKeys() {
			Object.keys(o).forEach((key) => {
				appendPath(key, paths, pathIndex);
			});

			return Reflect.ownKeys(o);
		},
		set(_target, key: string, newValue) {
			appendPath(key, paths, pathIndex);
			return Reflect.set(o, key, newValue);
		},
	});
};
