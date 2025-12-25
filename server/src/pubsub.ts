import type { WsMsg } from './types';
import type { WsServerMessageRecord } from './websocket';

let server: Bun.Server<undefined>;

export const pubsub = {
	init: (s: Bun.Server<undefined>) => {
		server = s;
	},
	publish: <T extends keyof WsServerMessageRecord>(
		type: T,
		payload: WsServerMessageRecord[T]
	) => {
		const data: WsMsg<any, any> = { type, payload };
		server.publish(type, JSON.stringify(data));
	},
};
