import { spawn } from 'node:child_process';
import { chmod, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

// https://github.com/microsoft/node-pty
// https://github.com/xtermjs/xterm.js

const SCRIPTS_DIR = '/home/andrey/Projects/scripts';

const abs = (path: string) => join(SCRIPTS_DIR, path);

export const getFilesList = async () => {
	return readdir(SCRIPTS_DIR, {
		recursive: true,
	}).then((files) => files.filter((f) => !f.startsWith('.')));
};

export const createFolder = async (path: string) => {
	await mkdir(abs(path));
};

export const deleteFolder = async (path: string) => {
	await rm(abs(path), { recursive: true, force: true });
};

export const createScript = async (path: string) => {
	await Bun.write(abs(path), '#!/bin/sh\n\n');
	await chmod(abs(path), 0o755);
};

export const updateScript = async (path: string, data: string) => {
	await Bun.write(abs(path), data);
	await chmod(abs(path), 0o755);
};

export const deleteScript = async (path: string) => {
	await Bun.file(abs(path)).delete();
};

export const readScript = async (path: string) => {
	return await Bun.file(abs(path)).text();
};

type RunScriptData =
	| {
			isDone: false;
			isError: boolean;
			line: string;
	  }
	| {
			isDone: true;
			code: number | string;
	  };

export const runScript = (path: string, signal: AbortSignal) => {
	const { readable, writable } = new TransformStream<string, string>();
	const writer = writable.getWriter();
	const decoder = new TextDecoder();

	const write = async (data: RunScriptData) => {
		return writer.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	path = 'test.sh';

	const proc = spawn(abs(path), {
		signal,
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	proc.on('spawn', () => {
		writer.write('event: "start"\n\n');
	});

	proc.on('close', async (code) => {
		try {
			await write({ isDone: true, code: code ?? 'ABORTED' });
			await writer.close();
		} catch (error) {}
	});

	proc.on('error', async (error) => {
		try {
			await write({ isDone: true, code: String(error) });
			await writer.close();
		} catch (error) {}
	});

	proc.stdout?.on('data', (chunk) => {
		const text = decoder.decode(chunk);
		for (const line of text.split('\n').filter(Boolean)) {
			write({ isDone: false, isError: false, line });
		}
	});

	proc.stderr?.on('data', (chunk) => {
		const text = decoder.decode(chunk);
		for (const line of text.split('\n').filter(Boolean)) {
			write({ isDone: false, isError: true, line });
		}
	});

	return readable;
};

type QueryParams =
	| {
			path?: string;
	  }
	| undefined;

const server = Bun.serve({
	development: true,
	port: 3001,
	routes: {
		'/api/script': async (req) => {
			const query = URL.parse(req.url)?.searchParams as QueryParams;

			return new Response(runScript(query?.path ?? '', req.signal), {
				status: 200,
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',

					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods':
						'GET, POST, PUT, DELETE, OPTIONS',
				},
			});
		},
	},
});

console.log(server.port);
