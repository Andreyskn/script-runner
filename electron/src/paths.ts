import path from 'path';

import isDev from 'electron-is-dev';

export const paths = {
	icon: isDev
		? path.resolve(__dirname, '../../public/icon_dev.png')
		: path.join(process.resourcesPath, 'icon.png'),
	trayIcon: isDev
		? path.resolve(__dirname, '../../public/icon_dev.png')
		: path.join(process.resourcesPath, 'icon_tray.png'),
	server: isDev
		? path.resolve(__dirname, '../../server/src/index.ts')
		: path.join(process.resourcesPath, 'server.js'),
};
