import { exec, spawn } from 'node:child_process';

import isDev from 'electron-is-dev';

if (!isDev) {
	const connection = Promise.withResolvers();

	const serverProc = spawn(
		'bun',
		[
			'~/Projects/script-runner/server/out/index.ts',
			'--port',
			process.env.PORT,
		],
		{
			shell: true,
			stdio: ['ignore', 'pipe', 'inherit'],
		}
	);

	serverProc.stdout.on('data', () => {
		connection.resolve();
	});

	serverProc.on('close', (code) => {
		// handle close
	});

	process.on('exit', () => {
		exec(`curl -s http://localhost:${process.env.PORT}/stop`);
	});

	await connection.promise;
}
