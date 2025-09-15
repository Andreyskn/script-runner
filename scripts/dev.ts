// import { $ } from "bun"
import type { SpawnOptions } from 'bun';

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
	Bun.spawn(['bun', '--watch', 'server/src/index.ts'], spawnOptions);
	Bun.spawn(
		['bunx', '--bun', 'vite', '--mode', 'dev', '--open'],
		spawnOptions
	);

	// process.on('SIGINT', async () => {
	// console.log('Cleaning up...');
	// Bun.spawn(["bun", "run", "db:down"])
	// await $`bun run db:down` will also work
	// });
};

dev();
