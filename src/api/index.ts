import {
	ipcBase,
	type IPC,
	type MainIpcMessages,
	type RendererIpcMessages,
} from '@electron/ipc';
import type { Service } from '@server/service';
import { type Topics, type WebSocketMessage } from '@server/websocket';
import { rpcClient } from 'typed-rpc';

export const ipc = ipcBase as IPC<RendererIpcMessages, MainIpcMessages>;

const rpc = rpcClient<Service>('http://localhost:3001/api/');

const originalFetch = window.fetch.bind(window);

type API = (typeof ipc)['call'] & Service;

//#region codegen scripts/rpcHandles.ts
const RPC_HANDLES = [
	'getFilesList',
	'moveFile',
	'deleteFile',
	'createFolder',
	'createScript',
	'updateScript',
	'readScript',
	'runScript',
	'abortScript',
] as const;
//#endregion

export const api: API = new Proxy(
	{},
	{
		get(_target, p: keyof API, _receiver) {
			return async (...args: any[]) => {
				if (RPC_HANDLES.includes(p as any)) {
					// @ts-ignore
					window.fetch = async function (input, init) {
						const res = await originalFetch(input + p, init);
						if (!res.ok) {
							throw Error(await res.text());
						}
						return res;
					};
					// @ts-ignore
					return rpc[p](...args);
				}

				// @ts-ignore
				return ipc.call[p](...args);
			};
		},
	}
) as API;

const websocket = new WebSocket('ws://localhost:3001/');

websocket.addEventListener('error', (e) => {
	console.error('WebSocket error:', e);
});

websocket.addEventListener('close', () => {
	console.log('WebSocket DISCONNECTED');
});

websocket.addEventListener('message', (e) => {
	const msg = JSON.parse(e.data) as Topics;
	console.log(msg);
});

type WebSocketMessages = { [T in WebSocketMessage as T['type']]: T['payload'] };

export const ws = {
	send: <T extends keyof WebSocketMessages>(
		type: T,
		payload: WebSocketMessages[T]
	) => {
		websocket.send(JSON.stringify({ type, payload }));
	},
	subscribe: <T extends keyof Topics>(
		topic: T,
		handle: (data: Topics[T]) => void
	) => {
		const handler = (e: MessageEvent<string>) => {
			const msg = JSON.parse(e.data) as { topic: any; data: any }; // TODO: fix type

			if (msg.topic === topic) {
				handle(msg.data);
			}
		};

		websocket.addEventListener('message', handler);
		ws.send('subscribe', { topic });

		return () => {
			websocket.removeEventListener('message', handler);
			ws.send('unsubscribe', { topic });
		};
	},
};
