import path from 'path';

import dotenv from 'dotenv';
import isDev from 'electron-is-dev';

if (!isDev) {
	dotenv.config({ path: path.join(process.resourcesPath, '.env') });

	dotenv.populate(
		process.env as any,
		{
			STATIC_DIR: path.join(process.resourcesPath, 'dist'),
		} satisfies Partial<(typeof process)['env']>,
		{
			override: true,
		}
	);
}
