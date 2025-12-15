import { $, type SpawnOptions, type Subprocess } from 'bun';
import { watch } from 'fs';
import { parseArgs } from 'util';

type Flags = {
	values: {
		mode: 'dev' | 'mock';
		port: string;
	};
};

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
}) as Flags;

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
	if (mode === 'mock') {
		Bun.spawn(
			['bunx', '--bun', 'vite', '--port', port, '--mode', mode],
			spawnOptions
		);
	}

	if (mode !== 'mock') {
		Bun.spawn(['bun', '--watch', 'server/src/index.ts'], spawnOptions);

		Bun.spawn(
			['bunx', '--bun', 'vite', 'build', '--mode', 'prod', '--watch'],
			spawnOptions
		);
	}

	let electronProc: Subprocess | null = null;

	const watcher = watch('./electron/build', async () => {
		if (electronProc) {
			await $`ps -o pgid= -p ${electronProc.pid} | xargs -I {} pgrep -f "electron " -g {} | xargs kill -TERM`.nothrow();
		}

		electronProc = Bun.spawn(
			['electron', '--trace-warnings', '.'],
			spawnOptions
		);
	});

	Bun.spawn(
		[
			'bun',
			'build',
			'./electron/src/main.ts',
			'--outdir',
			'./electron/build',
			'--target',
			'node',
			'--packages',
			'external',
			'--watch',
			'--no-clear-screen',
		],
		spawnOptions
	);

	Bun.spawn(
		[
			'bun',
			'build',
			'./electron/src/searchPreload.ts',
			'--outdir',
			'./electron/build',
			'--target',
			'node',
			'--format',
			'cjs',
			'--packages',
			'external',
			'--watch',
			'--no-clear-screen',
		],
		spawnOptions
	);

	process.on('SIGINT', async () => {
		console.log('\nCleaning up...');
		watcher.close();
		await new Promise((r) => setTimeout(r, 100));
	});
};

dev();
