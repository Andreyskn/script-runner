import { handleRpc } from 'typed-rpc/server';

import { server } from './common';
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

server.current = Bun.serve({
	development: true,
	port: 3001,
	idleTimeout: 255,
	routes: {
		'/api/*': {
			OPTIONS: () => new Response(null, cors),

			POST: async (req) => {
				const rpcData = await handleRpc(
					await req.json(),
					service as any
				);

				if ('error' in rpcData) {
					throw rpcData.error;
				}

				return Response.json(rpcData, cors);
			},
		},

		'/stop': async () => {
			console.log('Server is shutting down');
			process.exit(0);
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

console.log('Server is active on port:', server.current.port);
