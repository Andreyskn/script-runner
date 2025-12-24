import { handleRpc } from 'typed-rpc/server';

import { pubsub } from './pubsub';
import { service } from './service';
import { websocket } from './websocket';

// https://github.com/microsoft/node-pty
// https://github.com/xtermjs/xterm.js

const cors: ResponseInit = {
	headers: {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods':
			'GET, POST, PUT, PATCH, DELETE, OPTIONS',
		'Access-Control-Allow-Headers':
			'Content-Type, Authorization, X-Requested-With, Accept, Origin',
	},
};

const server = Bun.serve({
	development: true,
	port: 3001,
	idleTimeout: 255,
	routes: {
		'/api/*': {
			OPTIONS: () => new Response(null, cors),

			POST: async (req) => {
				const rpcData = await handleRpc(await req.json(), service);

				if ('error' in rpcData) {
					throw rpcData.error;
				}

				return Response.json(rpcData, cors);
			},
		},
	},

	fetch(req, server) {
		if (!server.upgrade(req)) {
			throw Error('WebSocket upgrade failed');
		}
	},

	websocket,

	error(error) {
		console.error(error);
		return new Response(error.message, {
			status: 500,
			headers: {
				'Content-Type': 'text/plain',
				...cors.headers,
			},
		});
	},
});

pubsub.init(server);

console.log('Server is active on port:', server.port);
