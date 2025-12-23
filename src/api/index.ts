import {
	ipcBase,
	type IPC,
	type MainIpcMessages,
	type RendererIpcMessages,
} from '@electron/ipc';
import type { Service } from '@server/service';
import { rpcClient } from 'typed-rpc';

export const ipc = ipcBase as IPC<RendererIpcMessages, MainIpcMessages>;

const rpc = rpcClient<Service>('http://localhost:3001/api');

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
] as const;
//#endregion

export const api: API = new Proxy(
	{},
	{
		get(_target, p: keyof API, _receiver) {
			return async (...args: any[]) => {
				if (RPC_HANDLES.includes(p as any)) {
					// @ts-ignore
					return rpc[p](...args);
				}

				// @ts-ignore
				return ipc.call[p](...args);
			};
		},
	}
) as API;
