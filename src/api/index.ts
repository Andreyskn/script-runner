import {
	ipcBase,
	type IPC,
	type MainIpcMessages,
	type RendererIpcMessages,
} from '@electron/ipc';
import type { Service } from '@server/service';
import {
	type WsClientMessageRecord,
	type WsServerMessage,
	type WsServerMessageRecord,
} from '@server/websocket';
import { rpcClient } from 'typed-rpc';

export const ipc = ipcBase as IPC<RendererIpcMessages, MainIpcMessages>;

const RPC_HANDLES = [
	//#region codegen scripts/rpcHandles.ts
	'getFilesList',
	'moveFile',
	'deleteFile',
	'createFolder',
	'createScript',
	'updateScript',
	'readScript',
	'runScript',
	'abortScript',
	'getScriptOutput',
	'getActiveScripts',
	'getArchivedExecs',
	//#endregion
] as const;

const rpc = rpcClient<Service>('http://localhost:3001/api/');

const originalFetch = window.fetch.bind(window);

type API = (typeof ipc)['call'] & Service;

export const api: API = new Proxy(
	{},
	{
		get(_target, p: keyof API) {
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
					const result = (await rpc[p](...args)) as Awaited<
						ReturnType<Service[keyof Service]>
					>;

					if (!result.ok) {
						console.log(`[${p}] RPC error:`, result.error);
					}

					return result;
				}

				if (ipc.available) {
					// @ts-ignore
					return ipc.call[p](...args);
				}
			};
		},
	}
) as API;

const websocket = new WebSocket('ws://localhost:3001/');
const wsConnection = Promise.withResolvers();

websocket.onopen = wsConnection.resolve;

const subscriptions = new Map<keyof WsServerMessageRecord, { count: number }>();

export const ws = {
	send: <T extends keyof WsClientMessageRecord>(
		type: T,
		payload: WsClientMessageRecord[T]
	) => {
		wsConnection.promise.then(() => {
			websocket.send(JSON.stringify({ type, payload }));
		});
	},
	subscribe: <T extends keyof WsServerMessageRecord>(
		topic: T,
		handle: (data: WsServerMessageRecord[T]) => void
	) => {
		const handler = (e: MessageEvent<string>) => {
			const msg = JSON.parse(e.data) as WsServerMessage;

			if (msg.type === topic) {
				handle(msg.payload as WsServerMessageRecord[T]);
			}
		};

		websocket.addEventListener('message', handler);

		if (subscriptions.has(topic)) {
			subscriptions.get(topic)!.count++;
		} else {
			subscriptions.set(topic, { count: 1 });
			ws.send('subscribe', { topic });
		}

		return () => {
			websocket.removeEventListener('message', handler);

			const count = --subscriptions.get(topic)!.count;
			if (count === 0) {
				subscriptions.delete(topic);
				ws.send('unsubscribe', { topic });
			}
		};
	},
};
