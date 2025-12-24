import { handleRpc } from 'typed-rpc/server';

import { runScript } from './handlers';
import { service } from './service';

// https://github.com/microsoft/node-pty
// https://github.com/xtermjs/xterm.js

const getQueryParams = <T extends Record<string, unknown>>(
	req: Bun.BunRequest
): Partial<T> => {
	const { searchParams } = URL.parse(req.url)!;
	return Object.fromEntries(searchParams.entries()) as Partial<T>;
};

type ScriptQueryParams = {
	path: string;
};

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
		'/api': {
			OPTIONS: () => new Response(null, cors),

			POST: async (req) => {
				const rpcData = await handleRpc(await req.json(), service);

				if ('error' in rpcData) {
					throw rpcData.error;
				}

				return Response.json(rpcData, cors);
			},
		},

		'/api/script/run': async (req) => {
			const { path } = getQueryParams<ScriptQueryParams>(req);

			const init: ResponseInit = {
				status: 200,
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					...cors.headers,
				},
			};

			if (!path) {
				return new Response(
					new ReadableStream({
						start(controller) {
							controller.enqueue(
								`data: ${JSON.stringify({ isDone: true, code: 'Script path was not provided' })}\n\n`
							);
							controller.close();
						},
					}),
					init
				);
			}

			return new Response(runScript(path, req.signal), init);
		},

		'/*': {
			OPTIONS: () => new Response(null, cors),
		},
	},

	error(error) {
		console.error(error);
		return new Response(`Internal Error: ${error.message}`, {
			status: 500,
			headers: {
				'Content-Type': 'text/plain',
				...cors.headers,
			},
		});
	},
});

console.log('Server is active on port:', server.port);
