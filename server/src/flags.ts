import { parseArgs } from 'util';

type Flags = {
	values: {
		socket: string;
	};
};

export const { values: flags } = parseArgs({
	args: Bun.argv,
	options: {
		socket: {
			type: 'string',
			default: '',
		},
	},
	strict: true,
	allowPositionals: true,
}) as Flags;
