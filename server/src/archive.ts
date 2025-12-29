import { func, type FuncGen } from '@andrey/func';
import CBuffer from 'CBuffer';

import { type ScriptOutput } from './common';
import { files, type FileId, type ScriptData } from './files';
import type { ExecEndData, ExecId, ScriptRunner } from './runner';

const ARCHIVE_CAPACITY = 10;

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

const entries = new Map<ExecId, ArchivedExec>();

const limiter = new CBuffer<ExecId>(ARCHIVE_CAPACITY);

limiter.overflow = (execId) => {
	entries.delete(execId);
};

const getArchivedExecs = func(function* (): FuncGen<ExecEndData[], {}> {
	return [...entries.values()].map((data) => {
		const {
			endedAt,
			execId,
			exitCode,
			fileId,
			output,
			path,
			startedAt,
			textVersion,
		} = data;

		return {
			active: false,
			endedAt,
			execId,
			exitCode,
			fileId,
			hasOutput: output.length > 0,
			path,
			startedAt,
			textVersion,
		};
	});
});

export const archive = {
	add: (runner: ScriptRunner, exitCode: number) => {
		const { endedAt, execId, fileId, output, startedAt } = runner;
		const { clientPath, textVersion } = files.registry.get(
			fileId
		) as ScriptData;

		const entry: ArchivedExec = {
			execId,
			endedAt: endedAt!,
			exitCode,
			fileId,
			output: output.toArray(),
			path: clientPath,
			textVersion,
			startedAt: startedAt!,
		};

		entries.set(execId, entry);
		limiter.push(execId);
	},
	get: entries.get.bind(entries),

	getArchivedExecs,
};
