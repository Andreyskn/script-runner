import { exec, spawn } from 'node:child_process';
import path from 'path';

import isDev from 'electron-is-dev';

if (!isDev) {
	const connection = Promise.withResolvers();

	const serverProc = spawn(
		'bun',
		[path.join(process.resourcesPath, 'server.js')],
		{
			shell: true,
			stdio: ['ignore', 'pipe', 'ignore'],
		}
	);

	serverProc.stdout.on('data', () => {
		connection.resolve();
	});

	serverProc.on('close', (code) => {
		// TODO: handle close
	});

	process.on('exit', () => {
		exec(`curl -s http://${process.env.IP}:${process.env.PORT}/stop`);
	});

	await connection.promise;
}
