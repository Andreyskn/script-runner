import { ipc } from '@/api';

export type Pack<T extends PackContent = any> = () => T;

export type Unpack<T extends PackContent = any> = (
	data: Exclude<T, undefined>
) => void;

export type PackContent =
	| string
	| number
	| boolean
	| null
	| undefined
	| PackContent[]
	| {
			[key: string]: PackContent;
	  };

const registry = new Map<PropertyKey, Pack>();

ipc.handle.getStateJson(() => statePacker.collect());

export const statePacker = {
	collect: () => {
		const packs: Record<PropertyKey, PackContent> = {};

		registry.forEach((pack, key) => {
			packs[key] = pack();
		});

		return JSON.stringify(packs);
	},
	unpack: (key: PropertyKey, unpack: Unpack): boolean => {
		const packs = ipc.config?.initialState;

		if (packs && packs[key]) {
			unpack(packs[key]);
			return true;
		}

		return false;
	},
	add: (key: PropertyKey, pack: Pack) => {
		registry.set(key, pack);
	},
	remove: (key: PropertyKey) => {
		registry.delete(key);
	},
};

export const createStatePack = <T extends PackContent>(
	key: PropertyKey,
	pack: Pack<T>,
	unpack: Unpack<T>
) => {
	statePacker.add(key, pack);

	const hasUnpacked = statePacker.unpack(key, unpack);

	return {
		hasUnpacked,
		remove: () => {
			statePacker.remove(key);
		},
	};
};
