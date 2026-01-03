import path from 'path';
import { fileURLToPath } from 'url';

import isDev from 'electron-is-dev';

export const paths = {
	icon: isDev
		? fileURLToPath(new URL('../../public/icon_dev.png', import.meta.url))
		: path.join(process.resourcesPath, 'icon.png'),
};
