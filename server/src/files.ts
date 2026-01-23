import { chmod, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'os';

import { func, type AsyncFuncGen, type DefaultErrorSet } from '@andrey/func';
import { ensureDir, move } from 'fs-extra';

import { errors, type ServiceErrors } from './errors';
import type { ScriptRunner } from './runner';
import { ws, type FileMoveData } from './websocket';

const SCRIPTS_DIR = `${homedir()}/Projects/scripts` as const;

const abs = (path: string) => join(SCRIPTS_DIR, path);

let nextId = 0;

const getId = () => nextId++;

export type FileId = number & {};

export type BaseFileData = {
	id: FileId;
	clientPath: string;
	fullPath: string;
};

export type ScriptData = BaseFileData & {
	type: 'script';
	textVersion: number;
	activeRunner?: ScriptRunner;
};

export type FolderData = BaseFileData & {
	type: 'folder';
};

export type FileData = ScriptData | FolderData;

export type ClientFileData = {
	id: number;
	path: string;
	type: 'folder' | 'script';
	runningSince?: string;
};

type CombinedFileData = Combine<FileData>;

const registry = new Map<FileId, FileData>();

const moveFile = func(async function* (
	id: FileId,
	newPath: string
): AsyncFuncGen<FileMoveData[], Pick<ServiceErrors, 'fileNotFound'>> {
	yield {
		fileNotFound: errors.fileNotFound,
	};
	const { error } = moveFile.utils;

	const target = registry.get(id);

	if (!target) {
		throw yield* error.fileNotFound();
	}

	const newFullPath = abs(newPath);

	await move(target.fullPath, newFullPath);

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

	const files: FileMoveData[] = [...affected].map((f) => ({
		id: f.id,
		path: f.clientPath,
	}));

	ws.publish('files-change', { type: 'move', files });
	return files;
});

const deleteFile = func(async function* (
	id: FileId
): AsyncFuncGen<FileId[], Pick<ServiceErrors, 'fileNotFound'>> {
	yield {
		fileNotFound: errors.fileNotFound,
	};
	const { error } = deleteFile.utils;

	const target = registry.get(id);

	if (!target) {
		throw yield* error.fileNotFound();
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
		(registry.get(id) as CombinedFileData).activeRunner?.controller.abort();
		registry.delete(id);
	});

	ws.publish('files-change', { type: 'delete', ids: [...affected] });
	return [...affected];
});

const createFolder = func(async function* (
	path: string
): AsyncFuncGen<ClientFileData, DefaultErrorSet> {
	const fullPath = abs(path);

	await mkdir(fullPath);

	const data: FileData = {
		id: getId(),
		clientPath: path,
		fullPath,
		type: 'folder',
	};

	registry.set(data.id, data);

	const file: ClientFileData = {
		id: data.id,
		path: data.clientPath,
		type: data.type,
	};

	ws.publish('files-change', { type: 'create', file });
	return file;
});

const createScript = func(async function* (
	path: string
): AsyncFuncGen<ClientFileData, DefaultErrorSet> {
	const fullPath = abs(path);

	await Bun.write(fullPath, '');
	await chmod(fullPath, 0o755);

	const data: FileData = {
		id: getId(),
		clientPath: path,
		fullPath,
		type: 'script',
		textVersion: 0,
	};

	registry.set(data.id, data);

	const file: ClientFileData = {
		id: data.id,
		path: data.clientPath,
		type: data.type,
	};

	ws.publish('files-change', { type: 'create', file });
	return file;
});

const updateScript = func(async function* (
	id: FileId,
	data: string,
	version: number
): AsyncFuncGen<
	boolean,
	Pick<ServiceErrors, 'fileNotFound' | 'versionTooLow'>
> {
	yield {
		fileNotFound: errors.fileNotFound,
		versionTooLow: errors.versionTooLow,
	};
	const { error } = updateScript.utils;

	const file = registry.get(id) as ScriptData | undefined;
	if (!file) {
		throw yield* error.fileNotFound();
	}

	if (file.textVersion >= version) {
		throw yield* error.versionTooLow(file.textVersion);
	}

	await Bun.write(file.fullPath, data);
	await chmod(file.fullPath, 0o755);

	file.textVersion = version;

	ws.publish('files-change', {
		type: 'script-content',
		id,
		version,
	});
	return true;
});

const readScript = func(async function* (
	id: FileId
): AsyncFuncGen<
	{ text: string; version: number },
	Pick<ServiceErrors, 'fileNotFound'>
> {
	yield {
		fileNotFound: errors.fileNotFound,
	};
	const { error } = readScript.utils;

	const file = registry.get(id) as ScriptData | undefined;
	if (!file) {
		throw yield* error.fileNotFound();
	}

	return {
		text: await Bun.file(file.fullPath).text(),
		version: file.textVersion,
	};
});

const getClientFileList = func(async function* (): AsyncFuncGen<
	ClientFileData[],
	{}
> {
	return [...registry.values()].map(
		(data): ClientFileData => ({
			id: data.id,
			path: data.clientPath,
			type: data.type,
			runningSince: (data as CombinedFileData).activeRunner?.startedAt,
		})
	);
});

export const files = {
	registry: registry as Map<FileId, CombinedFileData>,
	moveFile,
	deleteFile,
	createFolder,
	createScript,
	updateScript,
	readScript,
	getClientFileList,
};

// initialization
readdir(SCRIPTS_DIR, {
	recursive: true,
	withFileTypes: true,
}).then((files) => {
	// Files are sorted to maintain consistent IDs across server restarts.
	const collator = new Intl.Collator('en', { numeric: true });
	const filtered = files
		.filter((f) => {
			const notHidden =
				!f.parentPath.includes('/.') && !f.name.startsWith('.');

			return notHidden;
		})
		.map((f) => {
			const file = f as typeof f & { fullPath: string };
			file.fullPath = join(f.parentPath, f.name);

			return file;
		})
		.sort((a, b) => collator.compare(a.fullPath, b.fullPath));

	filtered.forEach((f) => {
		const data: CombinedFileData = {
			id: getId(),
			fullPath: f.fullPath,
			clientPath: f.fullPath.slice(SCRIPTS_DIR.length + 1),
			type: f.isDirectory() ? 'folder' : 'script',
			textVersion: 0,
		};

		registry.set(data.id, data as FileData);
	});
});
