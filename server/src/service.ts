import { files, type FileData, type FileId } from './files';
import { runningScripts, ScriptRunner } from './runner';

export type Service = typeof service;

export type ClientFileData = {
	id: FileId;
	path: string;
	type: FileData['type'];
	isRunningSince?: string;
};

export const service = {
	getFilesList: async () => {
		return [...files.registry.values()].map((data) => {
			return {
				id: data.id,
				path: data.clientPath,
				type: data.type,
				isRunningSince: data.activeRunner?.startTime,
			} satisfies ClientFileData;
		});
	},
	moveFile: async (id: FileId, newPath: string) => {
		await files.move(id, newPath);
		return null;
	},
	deleteFile: async (id: FileId) => {
		await files.delete(id);
		return null;
	},
	createFolder: async (path: string) => {
		await files.createFolder(path);
		return null;
	},
	createScript: async (path: string) => {
		await files.createScript(path);
		return null;
	},
	updateScript: async (id: FileId, data: string) => {
		await files.updateScript(id, data);
		return null;
	},
	readScript: async (id: FileId) => {
		return files.readScript(id);
	},
	runScript: async (id: FileId) => {
		const runner = new ScriptRunner(id);
		return runner.status === 'running';
	},
	abortScript: async (id: FileId) => {
		const runner = files.registry.get(id)?.activeRunner;
		runner?.controller.abort();
		return runner?.controller.signal.aborted ?? true;
	},
	getScriptOutput: async (id: FileId, skip = 0) => {
		const runner = files.registry.get(id)?.activeRunner;
		return runner?.output.slice(skip) ?? [];
	},
	getActiveScripts: async () => {
		return [...runningScripts];
	},
};
