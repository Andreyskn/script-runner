import chokidar from 'chokidar';
import { debounce } from 'lodash';

import { cmd } from './commands';
import { mode } from './flags';
import { signals } from './signals';

// TODO: start by prompting for a mode

switch (mode) {
	case 'mock': {
		cmd.viteDev();
		break;
	}
	case 'web': {
		cmd.backendStartWatch();
		cmd.viteDev();
		break;
	}
	case 'electron': {
		cmd.backendStartWatch();
		cmd.viteBuildWatch();
		cmd.electronBuildWatch();
		cmd.electronStart();
		chokidar.watch('electron/build').on(
			'all',
			debounce(() => {
				if (signals.autoRestartEnabled.value) {
					cmd.electronStart();
				}
			}, 50)
		);
		break;
	}
	default: {
		console.log(`Mode ${mode} is not implemented`);
	}
}
