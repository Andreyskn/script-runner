import type { ScriptOutput, TopicNames, WsMsg } from './types';

export type WsServerMessage =
	| WsMsg<`output:${string}`, { output: ScriptOutput }>
	| WsMsg<
			TopicNames.ScriptStatus,
			{ path: string; status: 'started' | 'exited'; timestamp: string }
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
