import net from 'net';

import { app, BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

import type { DevSocketMessage } from '../../scripts/dev/ipc';
import type {
	ElectronSocketMessage,
	ServerSocketMessage,
} from '../../server/src/socket';
import { mainWindow } from './mainWindow';
import { searchWindow } from './searchWindow';

if (isDev) {
	net.createConnection('\0script-runner-dev.sock').on('data', (data) => {
		switch (data.toString() as DevSocketMessage) {
			case 'refresh': {
				BrowserWindow.getAllWindows().forEach((win) => win.reload());
				console.log('Windows refreshed');
				break;
			}
			case 'quit': {
				app.quit();
				break;
			}
			case 'show-main': {
				mainWindow.open();
				break;
			}
			case 'show-search': {
				searchWindow.open();
				break;
			}
		}
	});
}

const connection = Promise.withResolvers();
const socketName = `script-runner-${Date.now()}.sock`;
let serverSocket: net.Socket;

net.createServer((socket) => {
	serverSocket = socket;
	connection.resolve();

	socket.on('data', (data) => {
		data.toString()
			.split('\n')
			.filter(Boolean)
			.forEach((chunk) => {
				const msg = JSON.parse(chunk) as ServerSocketMessage;
				listeners.forEach((listener) => listener(msg));
			});
	});
}).listen('\0' + socketName);

export type SocketListener = (msg: ServerSocketMessage) => void;

const listeners: Set<SocketListener> = new Set();

export const socket = {
	name: socketName,
	connection: connection.promise,
	addListener: (listener: SocketListener) => {
		listeners.add(listener);

		return () => {
			listeners.delete(listener);
		};
	},
	send: async (msg: ElectronSocketMessage) => {
		await socket.connection;
		serverSocket.write(JSON.stringify(msg) + '\n');
	},
};
