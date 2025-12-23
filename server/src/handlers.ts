import { $ } from 'bun';
import { move } from 'fs-extra';
import { chmod, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SCRIPTS_DIR = '/home/andrey/Projects/scripts';

const abs = (path: string) => join(SCRIPTS_DIR, path);

export const getFilesList = async () => {
	return readdir(SCRIPTS_DIR, {
		recursive: true,
	}).then((files) => files.filter((f) => !f.startsWith('.')));
};

export const moveFile = async (oldPath: string, newPath: string) => {
	await move(abs(oldPath), abs(newPath), { overwrite: true });
};

export const deleteFile = async (path: string) => {
	await $`gio trash ${abs(path)} && nautilus -q`;
};

export const createFolder = async (path: string) => {
	await mkdir(abs(path));
};

export const createScript = async (path: string) => {
	await Bun.write(abs(path), '#!/bin/sh\n\n');
	await chmod(abs(path), 0o755);
};

export const updateScript = async (path: string, data: string) => {
	await Bun.write(abs(path), data);
	await chmod(abs(path), 0o755);
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
	let controller: Bun.ReadableStreamController<string>;

	const stream = new ReadableStream<string>({
		start(c) {
			controller = c;
			c.enqueue('event: "start"\n\n');
		},
	});

	const heartbeat = setInterval(
		() => controller.enqueue('event: "heartbeat"\n\n'),
		250000
	);

	const write = (data: RunScriptData) => {
		controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
	};

	const cleanup = (code: number, error?: any) => {
		if (!signal.aborted) {
			if (error) {
				write({ isDone: false, isError: true, line: String(error) });
			}

			write({ isDone: true, code });
			controller.close();
		}
		clearInterval(heartbeat);
	};

	let proc: Bun.Subprocess<'ignore', 'pipe', 'pipe'>;

	try {
		proc = Bun.spawn([abs(path)], {
			signal,
			stdio: ['ignore', 'pipe', 'pipe'],
			onExit(_subprocess, exitCode, _signalCode, error) {
				cleanup(exitCode || 0, error);
			},
		});
	} catch (error) {
		cleanup(-1, error);
		return stream;
	}

	const decoder = new TextDecoder();

	Promise.all([
		(async () => {
			for await (const chunk of proc.stdout) {
				const text = decoder.decode(chunk);
				for (const line of text.split('\n').filter(Boolean)) {
					write({ isDone: false, isError: false, line });
				}
			}
		})(),
		(async () => {
			for await (const chunk of proc.stderr) {
				const text = decoder.decode(chunk);
				for (const line of text.split('\n').filter(Boolean)) {
					write({ isDone: false, isError: true, line });
				}
			}
		})(),
	]);

	return stream;
};
