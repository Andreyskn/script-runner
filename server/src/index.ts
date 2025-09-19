import {
	createFolder,
	createScript,
	deleteFile,
	getFilesList,
	moveFile,
	readScript,
	runScript,
	updateScript,
} from './handlers';

// https://github.com/microsoft/node-pty
// https://github.com/xtermjs/xterm.js

// TODO: heartbeat for long-running scripts

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
	},
};

const server = Bun.serve({
	development: true,
	port: 3001,
	idleTimeout: 255,
	routes: {
		'/api/file/list': async () => {
			return Response.json({ files: await getFilesList() }, cors);
		},

		'/api/file/move': {
			POST: async (req) => {
				if (!req.body) {
					throw new Error('Missing request body');
				}

				const data = (await req.body.json()) as {
					oldPath: string;
					newPath: string;
				};

				await moveFile(data.oldPath, data.newPath);

				return new Response(null, { ...cors, status: 200 });
			},
		},

		'/api/file': {
			POST: async (req) => {
				if (!req.body) {
					throw new Error('Missing request body');
				}

				const data = (await req.body.json()) as {
					path: string;
				};

				if (data.path.endsWith('.sh')) {
					await createScript(data.path);
				} else {
					await createFolder(data.path);
				}

				return new Response(null, { ...cors, status: 200 });
			},

			DELETE: async (req) => {
				if (!req.body) {
					throw new Error('Missing request body');
				}

				const data = (await req.body.json()) as {
					path: string;
				};

				await deleteFile(data.path);

				return new Response(null, { ...cors, status: 200 });
			},
		},

		'/api/script': {
			GET: async (req) => {
				const { path } = getQueryParams<ScriptQueryParams>(req);

				if (!path) {
					throw new Error('Script path was not provided');
				}

				return new Response(await readScript(path), cors);
			},

			POST: async (req) => {
				if (!req.body) {
					throw new Error('Missing request body');
				}

				const data = (await req.body.json()) as {
					path: string;
					text: string;
				};

				await updateScript(data.path, data.text);

				return new Response(null, { ...cors, status: 200 });
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

console.log(server.port);
