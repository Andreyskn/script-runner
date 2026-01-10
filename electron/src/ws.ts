import { Notification } from 'electron';
import WebSocket from 'ws';

import { SpecialExitCodes } from '../../server/src/common';
import type {
	WsClientMessage,
	WsServerMessage,
} from '../../server/src/websocket';
import { ipc } from './ipc';
import { mainWindow } from './mainWindow';
import { searchWindow } from './searchWindow';

const ws = new WebSocket(`wss://localhost:${process.env.PORT}/ws`, {
	rejectUnauthorized: false,
});

ws.on('open', () => {
	const subscriptions: WsClientMessage['payload']['topic'][] = [
		'script-status',
		'open-search-request',
	];

	subscriptions.forEach((topic) => {
		const msg: WsClientMessage = {
			type: 'subscribe',
			payload: { topic },
		};

		return ws.send(JSON.stringify(msg));
	});
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

ws.on('message', (data) => {
	const { type, payload } = JSON.parse(data.toString()) as WsServerMessage;

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
