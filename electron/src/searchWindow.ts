import { BrowserWindow, ipcMain, screen } from 'electron';
import { fileURLToPath } from 'url';

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

		webPreferences: {
			zoomFactor: 1.25,

			contextIsolation: true,
			nodeIntegration: false,
			preload: fileURLToPath(
				new URL('../build/searchPreload.js', import.meta.url)
			),
		},
	});

	win.loadURL(new URL('../../dist/index.html', import.meta.url).href);

	win.on('closed', createSearchWindow);
	win.on('blur', searchWindow.hide);
};

export const searchWindow = {
	init: createSearchWindow,
	show: () => {
		win?.webContents.send('show-search');
		win?.show();
	},
	hide: () => {
		win?.hide();
	},
};

ipcMain.on('end-search', (_event, scriptPath: string | null) => {
	console.log(scriptPath);
	searchWindow.hide();
});
