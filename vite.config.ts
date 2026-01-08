import net from 'net';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import type { DevSocketMessage } from './scripts/dev/ipc';

export default defineConfig(({ mode }) => ({
	base: './',
	clearScreen: false,
	plugins: [
		react(),
		tsconfigPaths(),
		{
			name: 'dev-ipc',
			configureServer(server) {
				net.createConnection('\0script-runner-dev.sock').on(
					'data',
					(data) => {
						const msg = data.toString() as DevSocketMessage;

						if (msg === 'refresh') {
							server.ws.send({ type: 'full-reload' });
							console.log('Reloaded (Fast Refresh failed)');
						}
					}
				);
			},
		},
	],
	build: {
		minify: mode !== 'dev',
		sourcemap: mode === 'dev',
		rollupOptions: {
			external: ['electron'],
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "/src/styles/breakpoints.scss" as *;`,
			},
		},
	},
}));
