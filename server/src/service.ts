import { $ } from 'bun';
import { move } from 'fs-extra';
import { chmod, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SCRIPTS_DIR = '/home/andrey/Projects/scripts';

const abs = (path: string) => join(SCRIPTS_DIR, path);

export type Service = typeof service;

export const service = {
	getFilesList: async () => {
		return readdir(SCRIPTS_DIR, {
			recursive: true,
		}).then((files) => files.filter((f) => !f.startsWith('.')));
	},
	moveFile: async (oldPath: string, newPath: string) => {
		await move(abs(oldPath), abs(newPath), { overwrite: true });
		return null;
	},
	deleteFile: async (path: string) => {
		await $`gio trash ${abs(path)} && nautilus -q`;
		return null;
	},
	createFolder: async (path: string) => {
		await mkdir(abs(path));
		return null;
	},
	createScript: async (path: string) => {
		await Bun.write(abs(path), '#!/bin/sh\n\n');
		await chmod(abs(path), 0o755);
		return null;
	},
	updateScript: async (path: string, data: string) => {
		await Bun.write(abs(path), data);
		await chmod(abs(path), 0o755);
		return null;
	},
	readScript: async (path: string) => {
		return await Bun.file(abs(path)).text();
	},
};
