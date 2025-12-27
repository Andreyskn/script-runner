import { BrowserWindow, screen } from 'electron';

import { paths } from './paths';

let win: BrowserWindow | null = null;

const createMainWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	win = new BrowserWindow({
		icon: paths.icon,
		width,
		height,
		titleBarStyle: 'hidden',
		titleBarOverlay: true,

		webPreferences: {
			zoomFactor: 1.25,

			contextIsolation: false,
			nodeIntegration: false,
		},
	});

	win.loadURL(paths.index);

	win.on('closed', () => {
		win = null;
	});
};

export const mainWindow = {
	open: () => {
		if (win) {
			win.show();
		} else {
			createMainWindow();
		}
	},
	close: () => {
		win?.close();
	},
};
