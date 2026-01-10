import EventEmitter from 'eventemitter3';

import { server, type Message, type ScriptOutput } from './common';
import type { ClientFileData, FileId } from './files';
import type { ExecData } from './runner';

export type FileMoveData = { id: FileId; path: string };

export type WsServerMessage =
	| Message<'open-search-request'>
	| Message<`output:${FileId}`, { output: ScriptOutput }>
	| Message<'script-status', ExecData>
	| Message<
			'files-change',
			| { type: 'script-content'; id: FileId; version: number }
			| { type: 'create'; file: ClientFileData }
			| { type: 'delete'; ids: FileId[] }
			| { type: 'move'; files: FileMoveData[] }
	  >;

export type WsServerMessageRecord = {
	[T in WsServerMessage as T['type']]: T['payload'];
};

export type WsClientMessage =
	| Message<'subscribe', { topic: WsServerMessage['type'] }>
	| Message<'unsubscribe', { topic: WsServerMessage['type'] }>;

export type WsClientMessageRecord = {
	[T in WsClientMessage as T['type']]: T['payload'];
};

export const websocket: Bun.WebSocketHandler<undefined> = {
	open(ws) {},
	close(ws) {
		ws.subscriptions.forEach((topic) => {
			ws.unsubscribe(topic);
		});
	},
	message(ws, message) {
		const { type, payload } = JSON.parse(
			message as string
		) as WsClientMessage;

		switch (type) {
			case 'subscribe': {
				ws.subscribe(payload.topic);
				break;
			}
			case 'unsubscribe': {
				ws.unsubscribe(payload.topic);
				break;
			}
		}
	},
};

type EventEmitterEvents = {
	[T in WsServerMessage as T['type']]: [T['payload']];
};

const ee = new EventEmitter<EventEmitterEvents>();

export const ws = {
	publish: <T extends keyof WsServerMessageRecord>(
		type: T,
		payload: WsServerMessageRecord[T]
	) => {
		const data: Message<any, any> = { type, payload };
		server.current.publish(type, JSON.stringify(data));
		// @ts-ignore
		ee.emit(type, payload);
	},
	on: ee.on.bind(ee),
};
