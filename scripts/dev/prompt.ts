import { select } from '@inquirer/prompts';
import { debounce } from 'lodash';
import open from 'open';

import { cmd } from './commands';
import { DEFAULT_PORT, flags, MODES, setFlag } from './flags';
import { ipc } from './ipc';
import { signals, when } from './signals';
import { cleanup } from './terminal';

const enum Choices {
	Restart = 'Restart electron',
	EnableAutoRestart = 'Enable auto-restart',
	DisableAutoRestart = 'Disable auto-restart',
	OpenInBrowser = 'Open in browser',
	Exit = 'Exit',
	OpenMainWindow = 'Open main window',
	OpenSearchWindow = 'Open search window',
}

let controller: AbortController | undefined;

export const prompt = {
	init: async () => {
		try {
			const selected = await select({
				message: 'Select mode',
				choices: MODES,
			});

			setFlag('mode', selected);

			if (selected === 'mock' && flags.port === DEFAULT_PORT) {
				setFlag('port', '5178');
			}
		} catch (error) {
			process.exit();
		}
	},
	hide: () => {
		controller?.abort();
		console.log('');
	},
	show: debounce(async () => {
		controller = new AbortController();

		try {
			const selected = await select(
				{
					message: '',
					choices: [
						flags.mode === 'electron' && Choices.Restart,
						flags.mode === 'electron' &&
							(signals.autoRestartEnabled.value
								? Choices.DisableAutoRestart
								: Choices.EnableAutoRestart),
						flags.mode !== 'electron' && Choices.OpenInBrowser,
						flags.mode === 'electron' && Choices.OpenMainWindow,
						flags.mode === 'electron' && Choices.OpenSearchWindow,
						Choices.Exit,
					].filter(Boolean),
				},
				{ signal: controller.signal }
			);

			switch (selected) {
				case Choices.Restart: {
					cmd.electronStart();
					break;
				}
				case Choices.EnableAutoRestart: {
					signals.autoRestartEnabled.value = true;
					break;
				}
				case Choices.DisableAutoRestart: {
					signals.autoRestartEnabled.value = false;
					break;
				}
				case Choices.OpenInBrowser: {
					open(`http://localhost:${flags.port}/`);
					break;
				}
				case Choices.OpenMainWindow: {
					if (!signals.electronRunning.value) {
						cmd.electronStart();
					}
					when(signals.electronRunning, true, () => {
						ipc.electron.write('show-main');
					});
					break;
				}
				case Choices.OpenSearchWindow: {
					if (!signals.electronRunning.value) {
						cmd.electronStart();
					}
					when(signals.electronRunning, true, () => {
						ipc.electron.write('show-search');
					});
					break;
				}
				case Choices.Exit: {
					ipc.electron.write('quit');
					cleanup();
					new Promise((r) => setTimeout(r, 100));
					process.exit();
					break;
				}
			}

			prompt.show();
		} catch (error) {}
	}, 1000),
};
