import type { Topics } from './websocket';

let server: Bun.Server<undefined>;

export const pubsub = {
	init: (s: Bun.Server<undefined>) => {
		server = s;
	},
	publish: <T extends keyof Topics>(topic: T, data: Topics[T]) => {
		server.publish(topic, JSON.stringify({ topic, data }));
	},
};
