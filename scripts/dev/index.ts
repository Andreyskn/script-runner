import chokidar from 'chokidar';
import { debounce } from 'lodash';

import { cmd } from './commands';
import { flags, MODES } from './flags';
import { ipc } from './ipc';
import { prompt } from './prompt';
import { signals } from './signals';

if (flags.mode === 'prompt' || !MODES.includes(flags.mode)) {
	await prompt.init();
}

switch (flags.mode) {
	case 'mock': {
		cmd.viteDev();
		break;
	}
	case 'web': {
		cmd.backendDev();
		cmd.viteDev();
		break;
	}
	case 'electron': {
		ipc.init();
		cmd.backendDev();
		cmd.viteBuildWatch();
		cmd.electronBuildWatch();
		cmd.electronStart();
		chokidar.watch('electron/build', { ignoreInitial: true }).on(
			'all',
			debounce(() => {
				if (signals.autoRestartEnabled.value) {
					cmd.electronStart();
				}
			}, 50)
		);
		break;
	}
}
