import { func, type FuncGen } from '@andrey/func';
import CBuffer from 'CBuffer';

import { type ScriptOutput } from './common';
import { files, type FileId } from './files';
import type { ExecEndData, ExecId } from './runner';
import { ws } from './websocket';

const ARCHIVE_CAPACITY = 20;

export type ArchivedExec = {
	execId: ExecId;
	fileId: FileId;
	path: string;
	textVersion: number;
	output: ScriptOutput[];
	exitCode: number;
	startedAt: string;
	endedAt: string;
};

const byExecId = new Map<ExecId, ArchivedExec>();
const byFileId = new Map<FileId, ArchivedExec>();

const limiter = new CBuffer<ExecId>(ARCHIVE_CAPACITY);

limiter.overflow = (execId) => {
	const entry = byExecId.get(execId)!;
	byExecId.delete(execId);
	byFileId.delete(entry.fileId);
};

const getArchivedExecs = func(function* (): FuncGen<ExecEndData[], {}> {
	return [...byExecId.values()].map((data) => ({
		active: false,
		endedAt: data.endedAt,
		execId: data.execId,
		exitCode: data.exitCode,
		fileId: data.fileId,
		hasOutput: data.output.length > 0,
		path: data.path,
		startedAt: data.startedAt,
		textVersion: data.textVersion,
	}));
});

export const archive = {
	get: byExecId.get.bind(byExecId),
	getArchivedExecs,
};

ws.on('script-status', (data) => {
	if (data.active) {
		return;
	}

	const runner = files.registry.get(data.fileId)?.activeRunner!;

	const entry: ArchivedExec = {
		execId: data.execId,
		endedAt: data.endedAt,
		exitCode: data.exitCode,
		fileId: data.fileId,
		output: runner.output.toArray(),
		path: data.path,
		textVersion: data.textVersion,
		startedAt: data.startedAt,
	};

	byExecId.set(data.execId, entry);
	byFileId.set(data.fileId, entry);
	limiter.push(data.execId);
});

ws.on('files-change', (data) => {
	if (data.type === 'move') {
		data.files.forEach((f) => {
			const entry = byFileId.get(f.id);

			if (entry) {
				entry.path = f.path;
			}
		});
	}
});
