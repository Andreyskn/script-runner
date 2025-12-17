import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import net from 'net';
import type { ElectronSocketMessage } from 'scripts/dev/ipc';

import { mainWindow } from './mainWindow';
import { searchWindow } from './searchWindow';

net.createConnection('/tmp/script-runner-dev.sock').on('data', (data) => {
	switch (data.toString() as ElectronSocketMessage) {
		case 'refresh': {
			BrowserWindow.getAllWindows().forEach((win) => win.reload());
			console.log('Windows refreshed');
			break;
		}
		case 'quit': {
			app.quit();
			break;
		}
		case 'show-main': {
			mainWindow.open();
			break;
		}
		case 'show-search': {
			searchWindow.open();
			break;
		}
	}
});

app.whenReady().then(() => {
	const icon = nativeImage.createFromDataURL(
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII='
	);
	const tray = new Tray(icon);
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Main', click: mainWindow.open },
		{ label: 'Search', click: searchWindow.open },
		{ type: 'separator' },
		{ label: 'Quit', click: app.quit },
	]);
	tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {});

// TODO: https://github.com/deiucanta/electron-typed-ipc/blob/master/src/index.ts
