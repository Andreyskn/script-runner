import {
	ipcBase,
	type IPC,
	type MainIpcMessages,
	type RendererIpcMessages,
} from '@electron/ipc';

export const ipc = ipcBase as IPC<RendererIpcMessages, MainIpcMessages>;
