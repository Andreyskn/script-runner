import { contextBridge, ipcRenderer } from 'electron';

export type SearchElectronAPI = typeof api;

const api = {
	endSearch: (scriptPath: string | null) => {
		ipcRenderer.send('end-search', scriptPath);
	},
	searchOnly: true,
};

contextBridge.exposeInMainWorld('electronAPI', api);
