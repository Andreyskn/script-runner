import { Notification } from 'electron';

import { SpecialExitCodes } from '../../server/src/common';
import type {
	WsClientMessage,
	WsServerMessage,
} from '../../server/src/websocket';
import { ipc } from './ipc';
import { mainWindow } from './mainWindow';
import { searchWindow } from './searchWindow';

const socket = new WebSocket(`ws://localhost:${process.env.PORT}/ws`);

socket.addEventListener('open', () => {
	const subscriptions: WsClientMessage['payload']['topic'][] = [
		'script-status',
		'open-search-request',
	];

	subscriptions
		.map((topic) => {
			const msg: WsClientMessage = {
				type: 'subscribe',
				payload: { topic },
			};

			return JSON.stringify(msg);
		})
		.forEach((m) => socket.send(m));
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
	const { type, payload } = JSON.parse(e.data) as WsServerMessage;

	switch (type) {
		case 'script-status': {
			if (!payload.active) {
				const { path, exitCode } = payload;

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
			break;
		}
		case 'open-search-request': {
			searchWindow.open();
			break;
		}
	}
});
