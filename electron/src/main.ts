import './env';
import './server';
import './ws';

import { app, Menu, Tray } from 'electron';

import { mainWindow } from './mainWindow';
import { paths } from './paths';
import { searchWindow } from './searchWindow';

app.commandLine.appendSwitch('log-level', '3');

app.whenReady().then(() => {
	const tray = new Tray(paths.trayIcon);
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Main', click: mainWindow.open },
		{ label: 'Search', click: searchWindow.open },
		{ type: 'separator' },
		{ label: 'Quit', click: app.quit },
	]);
	tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {});
