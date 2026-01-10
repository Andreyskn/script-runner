import { fileURLToPath } from 'url';

import { app, BrowserWindow, screen } from 'electron';
import createPositioner, { type State as WinPos } from 'electron-window-state';

import { ipc } from './ipc';
import { paths } from './paths';

let win: BrowserWindow | null = null;
let winPos: WinPos;
let appReady = Promise.withResolvers();

app.whenReady().then(() => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	winPos = createPositioner({
		defaultWidth: width,
		defaultHeight: height,
	});

	ipc.handle.appReady((winId) => {
		if (winId === 'main') {
			appReady.resolve();
		}
	});
});

const createMainWindow = () => {
	win = new BrowserWindow({
		x: winPos.x,
		y: winPos.y,
		width: winPos.width,
		height: winPos.height,

		icon: paths.icon,
		titleBarStyle: 'hidden',
		titleBarOverlay: true,

		webPreferences: {
			zoomFactor: 1.25,

			contextIsolation: false,
			nodeIntegration: false,
			preload: fileURLToPath(
				new URL('../build/mainPreload.js', import.meta.url)
			),
		},
	});
	winPos.manage(win);

	win.setBackgroundColor('#09090b');
	win.loadURL(`https://localhost:${process.env.PORT}/`);

	win.on('closed', () => {
		win = null;
		appReady = Promise.withResolvers();
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
	get appReady() {
		return appReady.promise;
	},
};
