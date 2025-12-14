import type { SpawnOptions } from 'bun';
import { parseArgs } from 'util';

const {
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
});

const spawnOptions: SpawnOptions.OptionsObject<
	'inherit',
	'inherit',
	'inherit'
> = {
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
};

const dev = async () => {
	if (mode === 'dev') {
		Bun.spawn(['bun', '--watch', 'server/src/index.ts'], spawnOptions);
	}

	Bun.spawn(
		['bunx', '--bun', 'vite', '--port', port, '--mode', mode],
		spawnOptions
	);

	// process.on('SIGINT', async () => {
	// console.log('Cleaning up...');
	// Bun.spawn(["bun", "run", "db:down"])
	// await $`bun run db:down` will also work
	// });
};

dev();
