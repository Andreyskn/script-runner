import { parseArgs } from 'util';

export const MODES = ['electron', 'web', 'mock'] as const;
export const DEFAULT_PORT = '5177';

type Flags = {
	values: {
		mode: (typeof MODES)[number];
		port: string;
	};
};

export const { values: flags } = parseArgs({
	args: Bun.argv,
	options: {
		mode: {
			type: 'string',
			default: 'prompt',
		},
		port: {
			type: 'string',
			default: DEFAULT_PORT,
		},
	},
	strict: true,
	allowPositionals: true,
}) as Flags;

export const setFlag = <T extends keyof Flags['values']>(
	flag: T,
	value: Flags['values'][T]
) => {
	flags[flag] = value;
};
