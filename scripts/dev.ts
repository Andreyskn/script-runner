import { type SpawnOptions, type Subprocess } from 'bun';
import chokidar from 'chokidar';
import { debounce } from 'lodash';
import net from 'net';
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

let electronSocket: net.Socket | null = null;

if (mode === 'dev') {
	net.createServer((socket) => {
		electronSocket = socket;
	}).listen('/tmp/script-runner-dev.sock');
}

const dev = async () => {
	if (mode === 'mock') {
		Bun.spawn(
			['bunx', '--bun', 'vite', '--port', port, '--mode', mode, '--open'],
			spawnOptions
		);
	}

	if (mode !== 'mock') {
		Bun.spawn(['bun', '--watch', 'server/src/index.ts'], spawnOptions);

		let buildingProc: Subprocess | null = null;

		chokidar
			.watch('src')
			.add('index.html')
			.on(
				'all',
				debounce(async () => {
					if (buildingProc) {
						buildingProc.kill(9);
					}
					buildingProc = Bun.spawn(
						['bunx', '--bun', 'vite', 'build'],
						{
							...spawnOptions,
							onExit: (_, code) => {
								if (code === 0) {
									buildingProc = null;
									electronSocket?.write('web-rebuild');
								}
							},
						}
					);
				}, 50)
			);
	}

	let electronExit: ReturnType<(typeof Promise)['withResolvers']> | undefined;

	chokidar.watch('electron/build').on(
		'all',
		debounce(async () => {
			electronSocket?.write('electron-rebuild');

			if (electronExit) {
				await electronExit.promise;
			}

			electronExit = Promise.withResolvers();

			Bun.spawn(['electron', '--trace-warnings', '.'], {
				...spawnOptions,
				onExit: electronExit!.resolve,
			});
		}, 100)
	);

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
			'--external',
			'electron',
			'--watch',
			'--no-clear-screen',
		],
		spawnOptions
	);
};

dev();
