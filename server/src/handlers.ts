import { $ } from 'bun';
import { move } from 'fs-extra';
import { spawn } from 'node:child_process';
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
	await $`gio trash ${abs(path)}`;
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
	const { readable, writable } = new TransformStream<string, string>();
	const writer = writable.getWriter();
	const decoder = new TextDecoder();

	const write = async (data: RunScriptData) => {
		return writer.write(`data: ${JSON.stringify(data)}\n\n`);
	};

	const proc = spawn(abs(path), {
		signal,
		stdio: ['ignore', 'pipe', 'pipe'],
	});

	proc.on('spawn', () => {
		writer.write('event: "start"\n\n');
	});

	proc.on('close', async (code) => {
		try {
			await write({ isDone: true, code: code ?? 'Aborted' });
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
