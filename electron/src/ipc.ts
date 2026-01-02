import type {
	IpcRenderer,
	MessageEvent as MessageEventMain,
	MessagePortMain,
} from 'electron';

import type { View } from '../../src/shared';
import type { MainWindowConfig } from './preload/mainPreload';
import type { SearchWindowConfig } from './preload/searchPreload';

export const ELECTRON_API_NAME = 'electronAPI';

export type MainIpcMessages = {
	setView: (view: View) => void;
};

export type RendererIpcMessages = {
	endSearch: (scriptId?: number) => void;
	appReady: (winId: WindowConfig['windowId']) => void;
};

export type WindowConfig = Combine<MainWindowConfig | SearchWindowConfig>;

type RemoveHandler = () => void;

export type IPC<
	Out extends Record<string, (...args: any[]) => any> = any,
	In extends Record<string, (...args: any[]) => any> = any,
> = {
	available: boolean;
	config?: WindowConfig;
	call: {
		[K in keyof Out]: (
			...args: Parameters<Out[K]>
		) => Promise<Awaited<ReturnType<Out[K]>>>;
	};
	handle: {
		[K in keyof In]: (
			handler: (...args: Parameters<In[K]>) => ReturnType<In[K]>
		) => RemoveHandler;
	};
};

type WindowAPI = ReturnType<typeof createWindowAPI>;

const isBrowser =
	typeof window !== 'undefined' && typeof document !== 'undefined';

const windowAPI = ((isBrowser && window[ELECTRON_API_NAME as any]) ||
	undefined) as WindowAPI | undefined;

const activePorts = new Set<MessagePortMain>();

if (windowAPI) {
	activePorts.add(windowAPI as any);
}

type PortHandler = (e: MessageEventMain | MessageEvent) => void;

const handlers = new Set<PortHandler>();

const port = {
	addListener(handler: PortHandler) {
		activePorts.forEach((p) => {
			p.addListener('message', handler);
		});
	},
	removeListener(handler: PortHandler) {
		activePorts.forEach((p) => {
			p.removeListener('message', handler);
		});
	},
	postMessage(data: unknown[]) {
		activePorts.forEach((p) => {
			p.postMessage(data);
		});
	},
};

export const createWindowAPI = (
	ipcRenderer: IpcRenderer,
	config?: WindowConfig
) => {
	let port: MessagePort;

	ipcRenderer.on('port', (e) => {
		port = e.ports[0];
		port.start();
	});

	return {
		config,
		connect: () => {
			ipcRenderer.invoke('connect');
		},
		postMessage: (data: unknown[]) => {
			port.postMessage(data);
		},
		addListener: (type: 'message', handler: PortHandler) => {
			port.addEventListener(type, handler);
		},
		removeListener: (type: 'message', handler: PortHandler) => {
			port.removeEventListener(type, handler);
		},
	};
};

let opId = 0;

const getOpId = () => {
	if (opId === Number.MAX_SAFE_INTEGER) {
		opId = 0;
	}

	return opId++;
};

export const ipcBase: IPC = new Proxy(
	{},
	{
		get(_target, p: keyof IPC, _receiver) {
			if (p === 'available') {
				return !isBrowser || !!windowAPI;
			}

			if (p === 'config') {
				return windowAPI?.config;
			}

			if (p === 'call') {
				return new Proxy(
					{},
					{
						get(_target, p, _receiver) {
							return (...args: any[]) => {
								const opId = getOpId();
								const result = Promise.withResolvers();
								const resultHandler: PortHandler = (e) => {
									const [id, data] = e.data;

									if (id === opId) {
										result.resolve(data);
										port.removeListener(resultHandler);
									}
								};

								port.postMessage([p, opId, ...args]);
								port.addListener(resultHandler);
								return result.promise;
							};
						},
					}
				);
			}

			if (p === 'handle') {
				return new Proxy(
					{},
					{
						get(_target, p, _receiver) {
							return (handle: (...args: any[]) => void) => {
								const handler: PortHandler = (e) => {
									const [name, id, ...args] = e.data;

									if (name === p) {
										Promise.resolve(handle(...args)).then(
											(result) => {
												port.postMessage([id, result]);
											}
										);
									}
								};

								port.addListener(handler);
								handlers.add(handler);

								return () => {
									port.removeListener(handler);
									handlers.delete(handler);
								};
							};
						},
					}
				);
			}
		},
	}
) as IPC;

export const ipc = ipcBase as IPC<MainIpcMessages, RendererIpcMessages>;

if (isBrowser) {
	windowAPI?.connect();
} else {
	(async () => {
		const electron = await import('electron');
		const { ipcMain, MessageChannelMain } = electron;

		ipcMain.handle('connect', (e) => {
			const { port1, port2 } = new MessageChannelMain();

			activePorts.add(port1);
			port1.start();

			handlers.forEach((handler) => {
				port1.addListener('message', handler);
			});

			port1.addListener('close', () => {
				activePorts.delete(port1);
				port1.close();
			});

			e.sender.postMessage('port', null, [port2]);
		});
	})();
}
