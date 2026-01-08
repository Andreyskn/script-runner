import nodeNet from 'net';
import { exec, spawn } from 'node:child_process';

import { app, net, protocol } from 'electron';
import isDev from 'electron-is-dev';
import type { JsonRpcRequest } from 'typed-rpc';

import type {
	ElectronSocketMessage,
	ServerSocketMessage,
} from '../../server/src/socket';
import { paths } from './paths';

const connection = Promise.withResolvers();
let serverSocket: nodeNet.Socket;

nodeNet
	.createServer((socket) => {
		serverSocket = socket;
		connection.resolve();
	})
	.listen('\0script-runner.sock');

app.whenReady().then(() => {
	protocol.handle('https', async (request) => {
		const { pathname } = new URL(request.url);

		if (!pathname.startsWith('/api/')) {
			return net.fetch(request.url, {
				bypassCustomProtocolHandlers: true,
				...request,
			});
		}

		const rpcRequest = (await request.json()) as JsonRpcRequest;
		const msg: ElectronSocketMessage = {
			type: 'rpc-request',
			payload: rpcRequest,
		};
		const response = Promise.withResolvers<Response>();

		const listener = (data: Buffer<ArrayBufferLike>) => {
			// TODO: root listener that parses data
			const msg = JSON.parse(data.toString()) as ServerSocketMessage;

			if (
				msg.type !== 'rpc-response' ||
				msg.payload.id !== rpcRequest.id
			) {
				return;
			}

			serverSocket.off('data', listener);

			if ('error' in msg.payload) {
				response.resolve(
					new Response(msg.payload.error.message, {
						status: 500,
					})
				);
				return;
			}

			response.resolve(
				new Response(JSON.stringify(msg.payload), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				})
			);
		};

		serverSocket.on('data', listener);
		serverSocket.write(JSON.stringify(msg));

		return response.promise;
	});
});

const args = [isDev && '--watch', paths.server].filter(Boolean) as string[];

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

await connection.promise;
