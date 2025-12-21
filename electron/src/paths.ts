import isDev from 'electron-is-dev';
import path from 'path';
import { fileURLToPath } from 'url';

export const paths = {
	icon: isDev
		? fileURLToPath(new URL('../../public/icon_dev.png', import.meta.url))
		: path.join(process.resourcesPath, 'icon.png'),
	index: new URL('../../dist/index.html', import.meta.url).href,
};
