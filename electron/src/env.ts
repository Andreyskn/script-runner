import { join } from 'path';

import dotenv from 'dotenv';
import isDev from 'electron-is-dev';

if (!isDev) {
	dotenv.config({ path: join(process.resourcesPath, '.env') });

	dotenv.populate(
		process.env as any,
		{
			STATIC_DIR: join(process.resourcesPath, 'dist'),
			CERT_DIR: join(process.resourcesPath, 'cert'),
		} satisfies Partial<(typeof process)['env']>,
		{
			override: true,
		}
	);
}
