import net from 'node:net';

import {
	handleRpc,
	type JsonRpcRequest,
	type JsonRpcResponse,
} from 'typed-rpc/server';

import type { Message } from './common';
import { service } from './service';

export type ServerSocketMessage = Message<'rpc-response', JsonRpcResponse>;

export type ElectronSocketMessage = Message<'rpc-request', JsonRpcRequest>;

const socket = net.createConnection('\0script-runner.sock');

socket.on('data', async (data) => {
	const msg = JSON.parse(data.toString()) as ElectronSocketMessage;

	switch (msg.type) {
		case 'rpc-request': {
			const rpcResponse = await handleRpc(msg.payload, service as any);

			const res: ServerSocketMessage = {
				type: 'rpc-response',
				payload: rpcResponse as any,
			};

			socket.write(JSON.stringify(res));
		}
	}
});
