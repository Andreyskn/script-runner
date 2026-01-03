import { join } from 'node:path';

import { handleRpc } from 'typed-rpc/server';

import { server } from './common';
import { service } from './service';
import { websocket, ws } from './websocket';

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
	development: process.env.NODE_ENV === 'development',
	port: process.env.PORT,
	websocket,
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

		'/ws': async (req) => {
			if (!server.current.upgrade(req)) {
				throw Error('WebSocket upgrade failed');
			}
		},

		'/search': async () => {
			ws.publish('open-search-request', undefined);
			return new Response(null, { status: 200, ...cors });
		},

		'/stop': async () => {
			console.log('Server is shutting down');
			process.exit(0);
		},

		'/*': async (req) => {
			const { pathname } = new URL(req.url);
			const path = join(
				process.env.STATIC_DIR,
				pathname === '/' ? 'index.html' : pathname
			);
			const file = Bun.file(path);

			if (await file.exists()) {
				return new Response(file, cors);
			}

			return new Response('Page not found', { status: 404, ...cors });
		},
	},
	error(error) {
		if (process.env.NODE_ENV === 'development') {
			console.error(error);
		}

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
