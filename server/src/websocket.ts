import type { ScriptOutput, WsMsg } from './types';

export const enum TopicNames {
	ScriptStatus = 'script-status',
}

export type Topics = Record<`output:${string}`, ScriptOutput> & {
	[TopicNames.ScriptStatus]: { path: string; status: 'started' | 'exited' };
};

export type WebSocketMessage =
	| WsMsg<'subscribe', { topic: keyof Topics }>
	| WsMsg<'unsubscribe', { topic: keyof Topics }>;

export const websocket: Bun.WebSocketHandler<undefined> = {
	open(ws) {
		ws.subscribe(TopicNames.ScriptStatus);
	},
	close(ws, code, reason) {
		console.log('WebSocket closed', { code, reason });

		ws.subscriptions.forEach((topic) => {
			ws.unsubscribe(topic);
		});
	},
	message(ws, message) {
		const { type, payload } = JSON.parse(
			message as string
		) as WebSocketMessage;

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
