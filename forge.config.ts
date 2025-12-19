import { MakerDeb } from '@electron-forge/maker-deb';
// import { MakerSnap } from '@electron-forge/maker-snap';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { $ } from 'bun';

export default {
	hooks: {
		prePackage: async () => {
			await $`bun ./scripts/bundle`;
		},
	},
	packagerConfig: {
		asar: true,
		extraResource: ['./electron/assets/icon.png'],
		executableName: 'script-runner',
	},
	rebuildConfig: {},
	makers: [
		new MakerDeb({
			options: {
				maintainer: 'Andrey <andskipin329@gmail.com>',
				icon: './electron/assets/icon.png',
				name: 'Script Runner',
				categories: ['Utility'],
			},
		}),
		// new MakerSnap(),
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
