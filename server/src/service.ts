import { type CallReturn } from '@andrey/func';
import type { JsonValue } from 'typed-rpc/server';

import { files, type Errors, type FileId } from './files';
import { runner } from './runner';

export type Service = typeof service;

export const service = {
	getFilesList: async () => {
		return files.getClientFileList().result();
	},
	moveFile: async (id: FileId, newPath: string) => {
		return files.moveFile(id, newPath).result();
	},
	deleteFile: async (id: FileId) => {
		return files.deleteFile(id).result();
	},
	createFolder: async (path: string) => {
		return files.createFolder(path).result();
	},
	createScript: async (path: string) => {
		return files.createScript(path).result();
	},
	updateScript: async (id: FileId, text: string, version: number) => {
		return files.updateScript(id, text, version).result();
	},
	readScript: async (id: FileId) => {
		return files.readScript(id).result();
	},
	runScript: async (id: FileId) => {
		return runner.runScript(id).result();
	},
	abortScript: async (id: FileId) => {
		return runner.abortScript(id).result();
	},
	getScriptOutput: async (id: FileId, skip = 0) => {
		return runner.getScriptOutput(id, skip).result();
	},
	getActiveScripts: async () => {
		return runner.getActiveScripts().result();
	},
} satisfies Record<
	string,
	(
		...args: any[]
	) => Promise<CallReturn<(...args: any[]) => JsonValue, Errors>>
>;
