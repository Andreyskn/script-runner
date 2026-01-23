import { fileURLToPath } from 'url';

import { app, BrowserWindow, screen } from 'electron';
import createPositioner, { type State as WinPos } from 'electron-window-state';
import fs from 'fs-extra';

import { ipc } from './ipc';
import { paths } from './paths';

const PRELOAD_PATH = fileURLToPath(
	new URL('../build/mainPreload.js', import.meta.url)
);

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
			preload: PRELOAD_PATH,
		},
	});
	winPos.manage(win);

	win.setBackgroundColor('#09090b');
	win.loadURL(`https://localhost:${process.env.PORT}/`);

	win.on('close', async (e) => {
		e.preventDefault();

		win?.hide();

		Promise.race([
			(async () => {
				const state = await ipc.call.getStateJson();

				(async () => {
					const content = await fs.readFile(PRELOAD_PATH, 'utf8');
					const firstLine = content.split('\n', 1)[0] || '';
					const [firstChar, secondChar] = firstLine;
					let newContent = `{} var INITIAL_APP_STATE = ${state};\n`;

					if (firstChar === '{' && secondChar === '}') {
						newContent += content.slice(firstLine.length + 1);
					} else {
						newContent += content;
					}

					await fs.writeFile(PRELOAD_PATH, newContent);
				})();
			})(),
			new Promise((r) => setTimeout(r, 500)),
		]).finally(() => {
			win?.destroy();
		});
	});

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
		const hasWin = !!win;
		win?.close();
		return hasWin;
	},
	toggle: () => {
		if (!mainWindow.close()) {
			mainWindow.open();
		}
	},
	get appReady() {
		return appReady.promise;
	},
};
