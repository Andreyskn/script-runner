import { contextBridge, ipcRenderer } from 'electron';

export type SearchElectronAPI = typeof electronApi;

const electronApi = {
	onShowSearch: (callback: () => void) => {
		ipcRenderer.on('show-search', callback);
	},
	endSearch: (scriptPath: string | null) => {
		ipcRenderer.send('end-search', scriptPath);
	},
	searchOnly: true,
};

contextBridge.exposeInMainWorld('electronAPI', electronApi);
