import net from 'net';

import { signals } from './signals';
import { print } from './terminal';

export type ElectronSocketMessage =
	| 'refresh'
	| 'quit'
	| 'show-main'
	| 'show-search';

type ElectronSocket = {
	write: (msg: ElectronSocketMessage) => void;
};

const noopProxy = new Proxy(
	{},
	{
		get(_target, _prop, receiver) {
			const fn = () => receiver;
			Object.setPrototypeOf(fn, receiver);
			return fn;
		},
	}
) as any;

export const ipc = {
	electron: noopProxy as ElectronSocket,
	init: () => {
		net.createServer((socket) => {
			ipc.electron = socket;
			signals.electronRunning.value = true;
			print('electron', 'Started...');

			socket.on('close', () => {
				ipc.electron = noopProxy;
				signals.electronRunning.value = false;
				print('electron', 'Stopped');
			});
		}).listen('\0script-runner-dev.sock');
	},
};
