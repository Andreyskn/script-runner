import type {
	IpcRenderer,
	MessageEvent as MessageEventMain,
	MessagePortMain,
} from 'electron';

import type { SearchWindowConfig } from './preload/searchPreload';

export const ELECTRON_API_NAME = 'electronAPI';

export type MainIpcMessages = {};

export type RendererIpcMessages = {
	endSearch: [scriptPath?: string];
};

export type WindowConfig = Partial<SearchWindowConfig>;

export type IPC<
	Out extends Record<string, unknown[]> = any,
	In extends Record<string, unknown[]> = any,
> = {
	init: () => Promise<boolean>;
	config?: WindowConfig;
	send: {
		[K in keyof Out]: (...args: Out[K]) => void;
	};
	subscribe: {
		[K in keyof In]: (handler: (...args: In[K]) => void) => () => void;
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

const connection = Promise.withResolvers<void>();

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
		connect: (cb: () => void) => {
			ipcRenderer.on('port', cb);
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

export const ipcBase = new Proxy(
	{},
	{
		get(_target, p: keyof IPC, _receiver) {
			if (p === 'config') {
				return windowAPI?.config;
			}

			if (p === 'init') {
				return async () => {
					if (isBrowser) {
						if (!windowAPI) {
							connection.reject();
							return connection.promise;
						}

						windowAPI.connect(connection.resolve);
						return connection.promise;
					} else {
						const { ipcMain, MessageChannelMain } = await import(
							'electron'
						);
						ipcMain.handle('connect', (e) => {
							const { port1, port2 } = new MessageChannelMain();

							activePorts.add(port1);
							port1.start();

							handlers.forEach((handler) => {
								port.addListener(handler);
							});

							port1.addListener('close', () => {
								activePorts.delete(port1);
								port1.close();
							});

							e.sender.postMessage('port', null, [port2]);
						});
					}
				};
			}

			if (p === 'send') {
				return new Proxy(
					{},
					{
						get(_target, p, _receiver) {
							return (...args: any[]) => {
								port.postMessage([p, ...args]);
							};
						},
					}
				);
			}

			if (p === 'subscribe') {
				return new Proxy(
					{},
					{
						get(_target, p, _receiver) {
							return (handle: (...args: any[]) => void) => {
								const handler: PortHandler = (e) => {
									const [name, ...args] = e.data;

									if (name === p) {
										handle(...args);
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
