import { ensureDir, move } from 'fs-extra';
import { chmod, mkdir, readdir } from 'node:fs/promises';
import { homedir } from 'os';
import path from 'path';

import { abs, SCRIPTS_DIR } from './common';
import { pubsub } from './pubsub';
import type { ScriptRunner } from './runner';
import type { ClientFileData } from './service';

let nextId = 0;

const getId = () => nextId++;

export type FileId = number;

export type FileData = {
	id: FileId;
	type: 'folder' | 'script';
	clientPath: string;
	fullPath: string;
	activeRunner?: ScriptRunner;
};

let registry = new Map<FileId, FileData>();

export const files = {
	registry,
	move: async (id: FileId, newPath: string) => {
		const target = registry.get(id);
		if (!target) {
			throw Error('File not found');
		}

		const newFullPath = abs(newPath);

		await move(target.fullPath, newFullPath, { overwrite: true });

		const affected = new Set([target]);

		if (target.type === 'folder') {
			const pathWithSlash = target.clientPath + '/';

			registry.forEach((file) => {
				if (file.clientPath.startsWith(pathWithSlash)) {
					affected.add(file);
					file.clientPath = file.clientPath.replace(
						target.clientPath,
						newPath
					);
					file.fullPath = abs(file.clientPath);
				}
			});
		}

		target.clientPath = newPath;
		target.fullPath = newFullPath;

		const files: ClientFileData[] = [...affected].map((f) => ({
			id: f.id,
			path: f.clientPath,
			type: f.type,
		}));

		pubsub.publish('files-change', { type: 'move', files });
	},
	delete: async (id: FileId) => {
		const target = registry.get(id);
		if (!target) {
			throw Error('File not found');
		}

		const filename = target.clientPath.split('/').pop()!;
		const timestamp = Date.now();

		const trashFiles = `${homedir()}/.local/share/Trash/files`;
		const trashInfo = `${homedir()}/.local/share/Trash/info`;

		await ensureDir(trashFiles);
		await ensureDir(trashInfo);

		const trashFilePath = `${trashFiles}/${timestamp}-${filename}`;
		const trashInfoPath = `${trashInfo}/${timestamp}-${filename}.trashinfo`;

		await move(target.fullPath, trashFilePath, { overwrite: true });
		await Bun.write(
			trashInfoPath,
			`[Trash Info]\nPath=${target.fullPath}\nDeletionDate=${new Date().toISOString()}\n`
		);

		const affected = new Set([target.id]);

		if (target.type === 'folder') {
			const pathWithSlash = target.clientPath + '/';

			registry.forEach((file) => {
				if (file.clientPath.startsWith(pathWithSlash)) {
					affected.add(file.id);
				}
			});
		}

		affected.forEach((id) => {
			registry.get(id)!.activeRunner?.controller.abort();
			registry.delete(id);
		});

		pubsub.publish('files-change', { type: 'delete', ids: [...affected] });
	},
	createFolder: async (path: string) => {
		const fullPath = abs(path);

		await mkdir(abs(path));

		const data: FileData = {
			id: getId(),
			clientPath: path,
			fullPath,
			type: 'folder',
		};

		registry.set(data.id, data);
		pubsub.publish('files-change', { type: 'create', file: data });
	},
	createScript: async (path: string) => {
		const fullPath = abs(path);

		await Bun.write(fullPath, '#!/bin/sh\n\n');
		await chmod(fullPath, 0o755);

		const data: FileData = {
			id: getId(),
			clientPath: path,
			fullPath,
			type: 'script',
		};

		registry.set(data.id, data);
		pubsub.publish('files-change', { type: 'create', file: data });
		return;
	},
	updateScript: async (id: FileId, data: string) => {
		const file = registry.get(id);
		if (!file) {
			throw Error('Script not found');
		}

		await Bun.write(file.fullPath, data);
		await chmod(file.fullPath, 0o755);

		pubsub.publish('files-change', {
			type: 'script-content',
			id,
		});
	},
	readScript: async (id: FileId) => {
		const file = registry.get(id);
		if (!file) {
			throw Error('Script not found');
		}

		return await Bun.file(file.fullPath).text();
	},
};

// initialization
readdir(SCRIPTS_DIR, {
	recursive: true,
	withFileTypes: true,
}).then((files) => {
	const filtered = files.filter((f) => {
		const notHidden = () => {
			return !f.parentPath.includes('/.') && !f.name.startsWith('.');
		};

		if (f.isDirectory()) {
			return notHidden();
		}

		return notHidden() && f.name.endsWith('.sh');
	});

	filtered.forEach((f) => {
		const fullPath = path.join(f.parentPath, f.name);

		const data: FileData = {
			id: getId(),
			fullPath,
			clientPath: fullPath.slice(SCRIPTS_DIR.length + 1),
			type: f.isDirectory() ? 'folder' : 'script',
		};

		registry.set(data.id, data);
	});
});
