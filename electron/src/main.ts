import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';

import { searchWindow } from './searchWindow.js';

// TODO: bun build instead of tsc
// TODO: bun server for ipc
// TODO: .ts files instead of package.json scripts

process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());

app.on('before-quit', async () => {
	BrowserWindow.getAllWindows().forEach((win) => win?.destroy());
	await new Promise((resolve) => setTimeout(resolve, 100));
});

app.whenReady().then(() => {
	const icon = nativeImage.createFromDataURL(
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII='
	);
	const tray = new Tray(icon);
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Main' },
		{ label: 'Search', click: searchWindow.show },
	]);
	tray.setContextMenu(contextMenu);

	searchWindow.init();
});
