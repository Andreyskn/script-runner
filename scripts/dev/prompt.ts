import { select } from '@inquirer/prompts';
import { debounce } from 'lodash';
import open from 'open';

import { cmd } from './commands';
import { mode } from './flags';
import { ipc } from './ipc';
import { signals, when } from './signals';

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
						mode === 'electron' && Choices.Restart,
						mode === 'electron' && signals.autoRestartEnabled.value
							? Choices.DisableAutoRestart
							: Choices.EnableAutoRestart,
						mode !== 'electron' && Choices.OpenInBrowser,
						mode === 'electron' && Choices.OpenMainWindow,
						mode === 'electron' && Choices.OpenSearchWindow,
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
					open('https://google.com');
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
					new Promise((r) => setTimeout(r, 100));
					process.exit();
					break;
				}
			}

			prompt.show();
		} catch (error) {}
	}, 1000),
};
