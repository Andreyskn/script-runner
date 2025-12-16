import { BrowserWindow, screen } from 'electron';

let win: BrowserWindow | null = null;

const createMainWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	win = new BrowserWindow({
		width,
		height,
		titleBarStyle: 'hidden',
		titleBarOverlay: true,

		webPreferences: {
			zoomFactor: 1.25,

			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	win.loadURL(new URL('../../dist/index.html', import.meta.url).href);

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
