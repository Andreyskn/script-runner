import { $ } from 'bun';
import { build, Platform, type Configuration } from 'electron-builder';

const options = {
	electronVersion: require('electron/package.json').version,
	appId: 'com.electron.script-runner',
	productName: 'Script Runner',
	directories: {
		output: '../out',
	},
	compression: 'store',
	files: 'build/**',
	asarUnpack: ['build/mainPreload.js'],
	extraResources: [
		{ from: '../public/icon.png', to: 'icon.png' },
		{ from: '../public/icon_tray.png', to: 'icon_tray.png' },
		{ from: '../.env.production', to: '.env' },
		{ from: '../dist', to: 'dist' },
		{ from: '../server/out/server.js', to: 'server.js' },
		{ from: '../server/cert', to: 'cert' },
	],
	linux: {
		icon: '..public/icon.png',
		target: ['deb'],
		category: 'Utility',
	},
	deb: {
		maintainer: 'Andrey <andskipin329@gmail.com>',
		icon: '..public/icon.png',
		category: 'Utility',
	},
	async beforePack() {
		await $`cd .. && bun ./scripts/bundle.ts`;
	},
} satisfies Configuration;

build({
	targets: Platform.LINUX.createTarget(),
	config: options,
}).then(() => {
	console.log(`
sudo dpkg -r script-runner && sudo dpkg -i ./out/script-runner_0.0.0_amd64.deb
`);
});
