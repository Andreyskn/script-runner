import type { FileData, FileId } from './files';
import type { ScriptStatus } from './runner';
import type { ClientFileData } from './service';
import type { ScriptOutput, WsMsg } from './types';

export type WsServerMessage =
	| WsMsg<`output:${FileId}`, { output: ScriptOutput }>
	| WsMsg<
			'script-status',
			{
				id: FileId;
				status: Exclude<ScriptStatus, 'idle'>;
				timestamp: string;
			}
	  >
	| WsMsg<
			'files-change',
			| { type: 'script-content'; id: FileId }
			| { type: 'create'; file: FileData }
			| { type: 'delete'; ids: FileId[] }
			| { type: 'move'; files: Omit<ClientFileData, 'isRunningSince'>[] }
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
