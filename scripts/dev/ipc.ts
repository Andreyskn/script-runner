import { debounce } from 'lodash';
import net from 'net';

import { signals } from './signals';
import { print } from './terminal';

export type DevSocketMessage = 'refresh' | 'quit' | 'show-main' | 'show-search';

type DevSocketSend = (msg: DevSocketMessage) => void;

const noopProxy = new Proxy(() => noopProxy, {
	get(_target, _prop, receiver) {
		const fn = () => receiver;
		Object.setPrototypeOf(fn, receiver);
		return fn;
	},
}) as any;

export const ipc = {
	send: noopProxy as DevSocketSend,
	debounceSend: debounce((m: DevSocketMessage) => ipc.send(m), 100),
	init: () => {
		net.createServer((socket) => {
			ipc.send = socket.write.bind(socket);
			signals.electronRunning.value = true;
			print('dev', 'IPC connected');

			socket.on('close', () => {
				ipc.send = noopProxy;
				signals.electronRunning.value = false;
				print('dev', 'IPC disconnected');
			});
		}).listen('\0script-runner-dev.sock');
	},
};
