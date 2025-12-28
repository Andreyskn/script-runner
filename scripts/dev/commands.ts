import { $, type Subprocess } from 'bun';
import chokidar from 'chokidar';
import { debounce } from 'lodash';

import { flags } from './flags';
import { ipc } from './ipc';
import { signals, when } from './signals';
import { spawn } from './terminal';

export const cmd = {
	viteDev: () => {
		spawn(
			'vite',
			`bunx --bun vite --port ${flags.port} --mode ${flags.mode} --open`
		);
	},
	viteBuildWatch: async () => {
		let buildingProc: Subprocess | null = null;

		chokidar
			.watch('src')
			.add('index.html')
			.add('electron/src/ipc.ts')
			.on(
				'all',
				debounce(async () => {
					if (buildingProc) {
						buildingProc.kill(9);
					}
					buildingProc = spawn(
						'vite',
						'bunx --bun vite build --mode dev',
						{
							onExit: (_, code) => {
								if (code === 0) {
									buildingProc = null;
									ipc.send('refresh');
								}
							},
						}
					);
				}, 50)
			);
	},
	backendDev: () => {
		spawn('server', 'bun --watch server/src/index.ts');
	},
	backendStop: async () => {
		try {
			await $`curl -s http://localhost:3001/stop`;
		} catch (error) {}
	},
	electronStart: () => {
		if (signals.electronStarting.value) {
			return;
		}

		signals.electronStarting.value = true;

		ipc.send('quit');

		when(signals.electronRunning, false, () => {
			spawn('electron', 'electron --trace-warnings .');

			when(signals.electronRunning, true, () => {
				signals.electronStarting.value = false;
			});
		});
	},
	electronBuildWatch: () => {
		spawn(
			'electron-src',
			'bun build ./electron/src/main.ts --outdir ./electron/build --target node --packages external --watch --no-clear-screen'
		);

		spawn(
			'electron-src',
			'bun build ./electron/src/preload/searchPreload.ts --outdir ./electron/build --target node --format cjs --external electron --watch --no-clear-screen'
		);
	},
};
