import { exec, spawn } from 'node:child_process';

import { app, net, protocol } from 'electron';
import isDev from 'electron-is-dev';
import type { JsonRpcRequest } from 'typed-rpc';

import { paths } from './paths';
import { rpc } from './rpc';
import { socket } from './sock';

app.whenReady().then(() => {
	protocol.handle('http', async (request) => {
		const { pathname } = new URL(request.url);

		if (!pathname.startsWith('/api/')) {
			return net.fetch(request.url, {
				bypassCustomProtocolHandlers: true,
				...request,
			});
		}

		const rpcRequest = (await request.json()) as JsonRpcRequest;
		const { response } = await rpc.call(rpcRequest);

		return response;
	});
});

const args = [isDev && '--watch', paths.server, '--socket', socket.name].filter(
	Boolean
) as string[];

exec(`curl -s https://localhost:${process.env.PORT}/stop`);

spawn('bun', args, {
	shell: true,
	stdio: [
		'ignore',
		isDev ? 'inherit' : 'ignore',
		isDev ? 'inherit' : 'ignore',
	],
});

process.on('exit', () => {
	exec(`curl -s https://localhost:${process.env.PORT}/stop`);
});

await socket.connection;
