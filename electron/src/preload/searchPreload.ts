import { contextBridge, ipcRenderer } from 'electron/renderer';

import { createWindowAPI, ELECTRON_API_NAME } from '../ipc';

export type SearchWindowConfig = typeof config;

const config = {
	searchOnly: true,
};

contextBridge.exposeInMainWorld(
	ELECTRON_API_NAME,
	createWindowAPI(ipcRenderer, config)
);
