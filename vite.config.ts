import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	base: './',
	logLevel: 'warn',
	clearScreen: false,
	plugins: [react(), tsconfigPaths()],
});
