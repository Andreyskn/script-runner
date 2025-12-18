import { app, BrowserWindow, Menu, Tray } from 'electron';
import isDev from 'electron-is-dev';
import net from 'net';
import type { ElectronSocketMessage } from 'scripts/dev/ipc';

import { mainWindow } from './mainWindow';
import { paths } from './paths';
import { searchWindow } from './searchWindow';

if (isDev) {
	net.createConnection('\0script-runner-dev.sock').on('data', (data) => {
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
}

app.whenReady().then(() => {
	const tray = new Tray(paths.icon);
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Main', click: mainWindow.open },
		{ label: 'Search', click: searchWindow.open },
		{ type: 'separator' },
		{ label: 'Quit', click: app.quit },
	]);
	tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {});
