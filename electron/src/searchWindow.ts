import { BrowserWindow, screen } from 'electron';
import isDev from 'electron-is-dev';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

import path from 'path';

let win: BrowserWindow | null = null;

const createSearchWindow = () => {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;

	win = new BrowserWindow({
		width,
		height,
		frame: false,
		transparent: true,
		resizable: false,
		show: false,
	});

	win.loadURL(
		isDev
			? 'http://localhost:5177/search'
			: `file://${path.join(__dirname, '../dist/index.html')}`
	);

	win.on('closed', createSearchWindow);
	win.on('blur', searchWindow.hide);
};

export const searchWindow = {
	init: createSearchWindow,
	show: () => {
		win?.show();
	},
	hide: () => {
		win?.hide();
	},
};
