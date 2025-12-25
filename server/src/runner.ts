import { files, type FileId } from './files';
import { pubsub } from './pubsub';
import {
	SpecialExitCodes,
	type RawScriptOutput,
	type ScriptOutput,
} from './types';

export const runningScripts = new Set<FileId>();

export type ScriptStatus = 'idle' | 'running' | 'ended';

export class ScriptRunner {
	controller = new AbortController();
	output: ScriptOutput[] = [];
	status: ScriptStatus = 'idle';
	startTime: string | undefined;
	endTime: string | undefined;

	constructor(public id: FileId) {
		files.registry.get(id)!.activeRunner = this;
		const { fullPath } = files.registry.get(this.id)!;
		this.run(fullPath);
	}

	toJSON() {
		return undefined;
	}

	appendOutput = (rawOutput: RawScriptOutput) => {
		const output: ScriptOutput = {
			...rawOutput,
			order: this.output.length,
			timestamp: new Date().toISOString(),
		};
		this.output.push(output);
		pubsub.publish(`output:${this.id}`, { output });
	};

	setStatus = (status: Exclude<ScriptStatus, 'idle'>) => {
		this.status = status;
		const timestamp = new Date().toISOString();

		switch (status) {
			case 'running': {
				this.startTime = timestamp;
				break;
			}
			case 'ended': {
				this.endTime = timestamp;
				break;
			}
		}

		pubsub.publish('script-status', {
			id: this.id,
			status,
			timestamp,
		});
	};

	finalize = (exitCode: number, error?: any) => {
		if (error) {
			this.appendOutput({ type: 'stderr', line: String(error) });
		}
		this.appendOutput({ type: 'exit', code: exitCode });

		this.setStatus('ended');
		runningScripts.delete(this.id);
		files.registry.get(this.id)!.activeRunner = undefined;
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
