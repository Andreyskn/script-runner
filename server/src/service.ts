import { ensureDir, move, writeFile } from 'fs-extra';
import { chmod, mkdir, readdir } from 'node:fs/promises';
import { homedir } from 'os';

import { abs, SCRIPTS_DIR } from './common';
import { pubsub } from './pubsub';
import { activeScripts, ScriptRunner } from './runner';

export type Service = typeof service;

export const service = {
	getFilesList: async () => {
		return readdir(SCRIPTS_DIR, {
			recursive: true,
		}).then((files) => files.filter((f) => !f.startsWith('.')));
	},
	moveFile: async (oldPath: string, newPath: string) => {
		await move(abs(oldPath), abs(newPath), { overwrite: true });

		pubsub.publish('files-change', { type: 'move', oldPath, newPath });
		return null;
	},
	deleteFile: async (path: string) => {
		const absPath = abs(path);
		const filename = path.split('/').pop()!;
		const timestamp = Date.now();

		const trashFiles = `${homedir()}/.local/share/Trash/files`;
		const trashInfo = `${homedir()}/.local/share/Trash/info`;

		await ensureDir(trashFiles);
		await ensureDir(trashInfo);

		const trashFilePath = `${trashFiles}/${timestamp}-${filename}`;
		const trashInfoPath = `${trashInfo}/${timestamp}-${filename}.trashinfo`;

		await move(absPath, trashFilePath, { overwrite: true });
		await writeFile(
			trashInfoPath,
			`[Trash Info]\nPath=${absPath}\nDeletionDate=${new Date().toISOString()}\n`
		);

		pubsub.publish('files-change', { type: 'delete', path });
		return null;
	},
	createFolder: async (path: string) => {
		await mkdir(abs(path));
		pubsub.publish('files-change', { type: 'create', path });
		return null;
	},
	createScript: async (path: string) => {
		await Bun.write(abs(path), '#!/bin/sh\n\n');
		await chmod(abs(path), 0o755);

		pubsub.publish('files-change', { type: 'create', path });
		return null;
	},
	updateScript: async (path: string, data: string) => {
		await Bun.write(abs(path), data);
		await chmod(abs(path), 0o755);

		pubsub.publish('files-change', { type: 'script-content', path });
		return null;
	},
	readScript: async (path: string) => {
		return await Bun.file(abs(path)).text();
	},
	runScript: async (path: string) => {
		const runner = new ScriptRunner(path);
		runner.run();
		return runner.status === 'running';
	},
	abortScript: async (path: string) => {
		const runner = activeScripts.get(path);

		if (!runner) {
			throw Error(`No active script with path: ${path}`);
		}

		runner.controller.abort();
		return runner.controller.signal.aborted;
	},
	getScriptOutput: async (path: string, skip = 0) => {
		const runner = activeScripts.get(path);

		if (!runner) {
			throw Error('Execution data is not available');
		}

		return runner.output.slice(skip);
	},
	getActiveScripts: async () => {
		const active: string[] = [];

		activeScripts.forEach((runner) => {
			if (runner.status === 'running') {
				active.push(runner.shortPath);
			}
		});

		return active;
	},
};
