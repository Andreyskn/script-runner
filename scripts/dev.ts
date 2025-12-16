import { type SpawnOptions, type Subprocess } from 'bun';
import chokidar from 'chokidar';
import { debounce } from 'lodash';
import net from 'net';
import { parse as shellParse } from 'shell-quote';
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

const spawn = (
	cmd: string,
	options?: SpawnOptions.OptionsObject<'ignore', 'pipe', 'inherit'>
) => {
	const args = shellParse(cmd).map((entry): string => {
		if (typeof entry === 'string') {
			return entry;
		}
		if ('op' in entry) {
			return entry.op === 'glob' ? entry.pattern : entry.op;
		}
		if ('comment' in entry) {
			return entry.comment;
		}
		return String(entry);
	});

	const proc = Bun.spawn(args, {
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'inherit',
		...options,
	});

	const reader = proc.stdout.getReader();

	(async () => {
		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				const text = new TextDecoder().decode(value);
				console.log(text);
			}
		} finally {
			reader.releaseLock();
		}
	})();

	return proc;
};

let electronSocket: net.Socket | null = null;

if (mode === 'dev') {
	net.createServer((socket) => {
		electronSocket = socket;
	}).listen('/tmp/script-runner-dev.sock');
}

const dev = async () => {
	if (mode === 'mock') {
		spawn(`bunx --bun vite --port ${port} --mode ${mode} --open`);
	}

	if (mode !== 'mock') {
		spawn('bun --watch server/src/index.ts');

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
					buildingProc = spawn('bunx --bun vite build', {
						onExit: (_, code) => {
							if (code === 0) {
								buildingProc = null;
								electronSocket?.write('refresh');
							}
						},
					});
				}, 50)
			);
	}

	let electronExit: ReturnType<(typeof Promise)['withResolvers']> | undefined;

	chokidar.watch('electron/build').on(
		'all',
		debounce(async () => {
			electronSocket?.write('quit');

			if (electronExit) {
				await electronExit.promise;
			}

			electronExit = Promise.withResolvers();

			spawn('electron --trace-warnings .', {
				onExit: electronExit!.resolve,
			});
		}, 50)
	);

	spawn(
		'bun build ./electron/src/main.ts --outdir ./electron/build --target node --packages external --watch --no-clear-screen'
	);

	spawn(
		'bun build ./electron/src/searchPreload.ts --outdir ./electron/build --target node --format cjs --external electron --watch --no-clear-screen'
	);
};

dev();
