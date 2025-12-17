import { parseArgs } from 'util';

type Flags = {
	values: {
		mode: 'web' | 'mock' | 'electron';
		port: string;
	};
};

export const {
	values: { mode, port },
} = parseArgs({
	args: Bun.argv,
	options: {
		mode: {
			type: 'string',
			default: 'dev',
		},
		port: {
			type: 'string',
			default: '5177',
		},
	},
	strict: true,
	allowPositionals: true,
}) as Flags;
