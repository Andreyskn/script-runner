import path from 'path';
import { fileURLToPath } from 'url';

import isDev from 'electron-is-dev';

export const paths = {
	icon: isDev
		? fileURLToPath(new URL('../../public/icon_dev.png', import.meta.url))
		: path.join(process.resourcesPath, 'icon.png'),
	trayIcon: isDev
		? fileURLToPath(new URL('../../public/icon_dev.png', import.meta.url))
		: path.join(process.resourcesPath, 'icon_tray.png'),
	server: isDev
		? fileURLToPath(new URL('../../server/src/index.ts', import.meta.url))
		: path.join(process.resourcesPath, 'server.js'),
};
