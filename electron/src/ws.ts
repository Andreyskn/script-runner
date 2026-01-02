import { Notification } from 'electron';

import { SpecialExitCodes } from '../../server/src/common';
import type { ExecData } from '../../server/src/runner';
import { ipc } from './ipc';
import { mainWindow } from './mainWindow';

const socket = new WebSocket(`ws://${process.env.IP}:${process.env.PORT}/ws`);

socket.addEventListener('open', () => {
	socket.send(
		JSON.stringify({
			type: 'subscribe',
			payload: { topic: 'script-status' },
		})
	);
});

const outcomeIndicator = (exitCode: number) => {
	switch (exitCode) {
		case 0:
			return '✅';
		case SpecialExitCodes.Aborted:
			return '🚫';
		default:
			return '❌';
	}
};

socket.addEventListener('message', (e) => {
	const data = JSON.parse(e.data).payload as ExecData;

	if (!data.active) {
		const { path, exitCode } = data;

		const notification = new Notification({
			title: `Script ${outcomeIndicator(exitCode)}`,
			body: `Execution complete: ${path}`,
		});

		notification.on('click', () => {
			mainWindow.open();

			mainWindow.appReady.then(() => {
				ipc.call.setView('history');
			});
		});

		notification.show();
	}
});
