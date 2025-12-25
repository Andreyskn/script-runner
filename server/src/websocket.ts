import type { ScriptStatus } from './runner';
import type { ScriptOutput, WsMsg } from './types';

export type WsServerMessage =
	| WsMsg<`output:${string}`, { output: ScriptOutput }>
	| WsMsg<
			'script-status',
			{
				path: string;
				status: Exclude<ScriptStatus, 'idle'>;
				timestamp: string;
			}
	  >
	| WsMsg<
			'files-change',
			| { type: 'script-content'; path: string }
			| { type: 'create'; path: string }
			| { type: 'delete'; path: string }
			| { type: 'move'; oldPath: string; newPath: string }
	  >;

export type WsServerMessageRecord = {
	[T in WsServerMessage as T['type']]: T['payload'];
};

export type WsClientMessage =
	| WsMsg<'subscribe', { topic: WsServerMessage['type'] }>
	| WsMsg<'unsubscribe', { topic: WsServerMessage['type'] }>;

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
