import { BrowserWindow, screen } from 'electron';
import { fileURLToPath } from 'url';

import { ipc } from './ipc';
import { paths } from './paths';

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

			contextIsolation: true,
			nodeIntegration: false,
			preload: fileURLToPath(
				new URL('../build/searchPreload.js', import.meta.url)
			),
		},
	});

	win.loadURL(paths.index);

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

ipc.subscribe.endSearch((scriptPath) => {
	console.log(scriptPath);
	searchWindow.close();
});
