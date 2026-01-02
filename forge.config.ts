import { MakerDeb } from '@electron-forge/maker-deb';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { $ } from 'bun';

export default {
	hooks: {
		prePackage: async () => {
			await $`bun ./scripts/bundle`;
		},
		generateAssets: async () => {
			await $`cp ./.env.production ./.env`;
		},
		postMake: async () => {
			await $`rm ./.env`;
		},
	},
	packagerConfig: {
		asar: true,
		extraResource: [
			'./public/icon.png',
			'./.env',
			'./dist',
			'./server/out/server.js',
		],
	},
	rebuildConfig: {},
	makers: [
		new MakerDeb({
			options: {
				maintainer: 'Andrey <andskipin329@gmail.com>',
				icon: './public/icon.png',
				productName: 'Script Runner',
				categories: ['Utility'],
			},
		}),
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
} satisfies ForgeConfig;
