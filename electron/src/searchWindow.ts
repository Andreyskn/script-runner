import { fileURLToPath } from 'url';

import { BrowserWindow, screen } from 'electron';

import { ipc } from './ipc';
import { paths } from './paths';
import { rpc } from './rpc';

let win: BrowserWindow | null = null;

const createSearchWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	win = new BrowserWindow({
		icon: paths.icon,
		width,
		height,
		frame: false,
		transparent: true,
		resizable: false,

		webPreferences: {
			zoomFactor: 1.25,

			contextIsolation: false,
			nodeIntegration: false,
			preload: fileURLToPath(
				new URL('../build/searchPreload.js', import.meta.url)
			),
		},
	});

	win.loadURL(`http://localhost:${process.env.PORT}/`);

	win.on('blur', searchWindow.close);

	win.on('closed', () => {
		win = null;
	});
};

export const searchWindow = {
	open: () => {
		createSearchWindow();
	},
	close: () => {
		win?.close();
	},
};

ipc.handle.endSearch((scriptId) => {
	if (scriptId) {
		rpc.runScript(scriptId);
	}
	searchWindow.close();
});
