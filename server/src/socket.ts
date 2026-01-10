import net from 'node:net';

import {
	handleRpc,
	type JsonRpcRequest,
	type JsonRpcResponse,
} from 'typed-rpc/server';

import type { Message } from './common';
import { flags } from './flags';
import { service } from './service';

export type ServerSocketMessage = Message<'rpc-response', JsonRpcResponse>;

export type ElectronSocketMessage = Message<'rpc-request', JsonRpcRequest>;

if (flags.socket) {
	const socket = net.createConnection('\0' + flags.socket);

	socket.on('data', async (data) => {
		data.toString()
			.split('\n')
			.filter(Boolean)
			.forEach(async (chunk) => {
				const msg = JSON.parse(chunk) as ElectronSocketMessage;

				switch (msg.type) {
					case 'rpc-request': {
						const rpcResponse = await handleRpc(
							msg.payload,
							service as any
						);

						const res: ServerSocketMessage = {
							type: 'rpc-response',
							payload: rpcResponse as any,
						};

						socket.write(JSON.stringify(res) + '\n');
					}
				}
			});
	});
}
