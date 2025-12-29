import { func, type FuncGen } from '@andrey/func';
import CBuffer from 'CBuffer';

import { archive } from './archive';
import {
	SpecialExitCodes,
	type RawScriptOutput,
	type ScriptOutput,
} from './common';
import { errors, type ServiceErrors } from './errors';
import { files, type FileId, type ScriptData } from './files';
import { ws } from './websocket';

const OUTPUT_CAPACITY = 30;

export type ExecId = number & {};

let execId = 0;

const getExecId = (): ExecId => {
	if (execId === Number.MAX_SAFE_INTEGER) {
		execId = 0;
	}

	return execId++;
};

const activeRunners = new Map<ExecId, ScriptRunner>();

export type ExecStartData = {
	active: true;
	path: string;
	execId: number;
	fileId: FileId;
	startedAt: string;
	textVersion: number;
};

export type ExecEndData = Replace<ExecStartData, { active: false }> & {
	exitCode: number;
	hasOutput: boolean;
	endedAt: string;
};

export type ExecData = ExecStartData | ExecEndData;

export type ScriptStatus = 'idle' | 'running' | 'ended';

export class ScriptRunner {
	fileId: FileId = -1;
	controller = new AbortController();
	output = new CBuffer<ScriptOutput>(OUTPUT_CAPACITY);
	status: ScriptStatus = 'idle';
	execId: ExecId = -1;
	startedAt: string | undefined;
	endedAt: string | undefined;

	constructor(fileId: FileId) {
		this.fileId = fileId;
		const data = files.registry.get(fileId) as ScriptData;
		data.activeRunner = this;
		this.run(data.fullPath);
	}

	appendOutput = (rawOutput: RawScriptOutput) => {
		const output: ScriptOutput = {
			...rawOutput,
			order: (this.output.last()?.order ?? -1) + 1,
			timestamp: new Date().toISOString(),
		};
		this.output.push(output);
		ws.publish(`output:${this.fileId}`, { output });
	};

	setStatus = (status: Exclude<ScriptStatus, 'idle'>, exitCode?: number) => {
		this.status = status;
		const timestamp = new Date().toISOString();
		const { clientPath, textVersion } = files.registry.get(
			this.fileId
		) as ScriptData;

		const baseExecData: OmitType<ExecStartData, 'active'> = {
			fileId: this.fileId,
			execId: this.execId,
			startedAt: this.startedAt ?? timestamp,
			path: clientPath,
			textVersion,
		};

		switch (status) {
			case 'running': {
				this.startedAt = timestamp;
				this.execId = getExecId();

				activeRunners.set(this.execId, this);

				ws.publish('script-status', {
					...baseExecData,
					active: true,
					execId: this.execId,
				});
				break;
			}
			case 'ended': {
				this.endedAt = timestamp;

				activeRunners.delete(this.execId);
				archive.add(this, exitCode!);

				ws.publish('script-status', {
					...baseExecData,
					active: false,
					exitCode: exitCode!,
					hasOutput: this.output.length > 0,
					endedAt: timestamp,
				});
				break;
			}
		}
	};

	finalize = (exitCode: number, error?: any) => {
		if (error) {
			this.appendOutput({ type: 'stderr', line: String(error) });
		}

		this.setStatus('ended', exitCode);
		(files.registry.get(this.fileId) as ScriptData).activeRunner =
			undefined;
	};

	private run = (path: string) => {
		const proc = Bun.spawn([path], {
			signal: this.controller.signal,
			stdio: ['ignore', 'pipe', 'pipe'],
			onExit: (_subprocess, exitCode, _signalCode, error) => {
				if (this.controller.signal.aborted) {
					exitCode = SpecialExitCodes.Aborted;
				}
				this.finalize(exitCode || 0, error);
			},
		});

		this.setStatus('running');

		const decoder = new TextDecoder();

		Promise.all([
			(async () => {
				for await (const chunk of proc.stdout) {
					const text = decoder.decode(chunk);
					for (const line of text.split('\n').filter(Boolean)) {
						this.appendOutput({ type: 'stdout', line });
					}
				}
			})(),
			(async () => {
				for await (const chunk of proc.stderr) {
					const text = decoder.decode(chunk);
					for (const line of text.split('\n').filter(Boolean)) {
						this.appendOutput({ type: 'stderr', line });
					}
				}
			})(),
		]);
	};
}

const runScript = func(function* (id: FileId): FuncGen<boolean, {}> {
	const runner = new ScriptRunner(id);
	return runner.status === 'running';
});

const abortScript = func(function* (id: FileId): FuncGen<boolean, {}> {
	const runner = files.registry.get(id)?.activeRunner;
	runner?.controller.abort();
	return runner?.controller.signal.aborted ?? true;
});

const getScriptOutput = func(function* (
	execId: ExecId
): FuncGen<ScriptOutput[], Pick<ServiceErrors, 'noOutput'>> {
	yield {
		noOutput: errors.noOutput,
	};
	const { error } = getScriptOutput.utils;

	const activeRunner = activeRunners.get(execId);

	if (activeRunner) {
		return activeRunner.output.toArray();
	}

	const archived = archive.get(execId);

	if (!archived) {
		throw yield* error.noOutput();
	}

	return archived.output;
});

const getActiveScripts = func(function* (): FuncGen<ExecStartData[], {}> {
	return [...activeRunners.values()].map((runner): ExecStartData => {
		const { fileId, startedAt, execId } = runner;
		const file = files.registry.get(fileId) as ScriptData;
		const { clientPath, textVersion } = file;

		return {
			active: true,
			fileId,
			execId,
			startedAt: startedAt!,
			path: clientPath,
			textVersion,
		};
	});
});

export const runner = {
	runScript,
	abortScript,
	getScriptOutput,
	getActiveScripts,
};
