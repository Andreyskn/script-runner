import chokidar from 'chokidar';
import { debounce } from 'lodash';

import { cmd } from './commands';
import { flags, MODES } from './flags';
import { ipc } from './ipc';
import { prompt } from './prompt';
import { cleanup } from './terminal';

if (!MODES.includes(flags.mode)) {
	await prompt.init();
}

switch (flags.mode) {
	case 'mock': {
		cmd.viteDev();
		break;
	}
	case 'web': {
		ipc.init();
		cmd.backendDev();
		cmd.viteDev();
		break;
	}
	case 'electron': {
		ipc.init();
		cmd.backendDev();
		cmd.viteBuildWatch();
		cmd.electronBuildWatch();
		chokidar
			.watch('electron/build')
			.on('all', debounce(cmd.electronStart, 50));
		break;
	}
}

process.on('exit', () => {
	ipc.send('quit');
	cleanup();
	Bun.spawnSync(['reset']);
});
