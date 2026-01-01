import { useEffect, useRef, useState } from 'react';

import EventEmitter from 'eventemitter3';

import { useUpdate } from './useUpdate';

export abstract class ComponentStore<S extends Record<string, unknown>> {
	abstract state: S;

	private initializedSelectors: S | undefined;

	public get selectors(): S {
		if (this.initializedSelectors) {
			return this.initializedSelectors;
		}

		const { state, useSelector } = this;
		const selectors = {} as S;

		Object.keys(state).forEach((key) => {
			Object.defineProperty(selectors, key, {
				get: function () {
					return useSelector((state: S) => state[key]);
				},
			});
		});

		return (this.initializedSelectors = selectors);
	}

	private ee = new EventEmitter<string>();

	public subscribe = <T extends (state: Readonly<S>) => any>(
		select: T,
		onChange: (data: ReturnType<T>) => void,
		initialOnChange?: boolean
	) => {
		const paths: string[] = [];
		select(newProxy(this.state, paths));
		const pathSet = new Set(paths);

		const listener = () => {
			onChange(select(this.state));
		};

		for (const p of pathSet) {
			this.ee.on(p, listener);
		}

		if (initialOnChange) {
			listener();
		}

		return () => {
			for (const p of pathSet) {
				this.ee.off(p, listener);
			}
		};
	};

	protected setState = (update: (state: S) => void) => {
		const paths: string[] = [];
		update(newProxy(this.state, paths));

		for (const p of new Set(paths)) {
			this.ee.emit(p);
		}
	};

	public useSelector = <D, T = D>(
		select: (state: Readonly<S>) => D,
		transform?: (selected: D) => T
	) => {
		const { update } = useUpdate();

		const transformRef = useRef(transform);
		transformRef.current = transform;

		const result = useRef<T>(null as any);

		const [cleanup] = useState(() => {
			return this.subscribe(
				select,
				(data) => {
					// @ts-ignore
					result.current = transformRef.current
						? transformRef.current(data)
						: data;
					update();
				},
				true
			);
		});

		useEffect(() => cleanup, []);

		return result.current;
	};
}

const isObject = (value: any) => {
	return !!value && typeof value === 'object' && !Array.isArray(value);
};

const appendPath = (key: string, paths: string[], index = paths.length) => {
	if (!paths[index]) {
		paths[index] = '';
	}
	paths[index] += `/${key}`;
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
