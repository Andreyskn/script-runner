import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	base: './',
	clearScreen: false,
	plugins: [react(), tsconfigPaths()],
	build: {
		minify: mode !== 'dev',
	},
}));
