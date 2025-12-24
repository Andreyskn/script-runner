import { abs } from './common';
import { pubsub } from './pubsub';
import type { RawScriptOutput, ScriptOutput } from './types';
import { TopicNames } from './websocket';

const enum SpecialExitCodes {
	Aborted = 1001,
}

export type Status = 'idle' | 'started' | 'exited';

class ScriptRunner {
	controller = new AbortController();
	output: ScriptOutput[] = [];
	status: Status = 'idle';
	fullPath: string;

	constructor(private shortPath: string) {
		activeScripts.set(shortPath, this);
		this.fullPath = abs(shortPath);
	}

	appendOutput = (rawOutput: RawScriptOutput) => {
		const output: ScriptOutput = {
			...rawOutput,
			order: this.output.length,
			timestamp: new Date().toISOString(),
		};
		this.output.push(output);
		pubsub.publish(`output:${this.shortPath}`, output);
	};

	setStatus = (status: Exclude<Status, 'idle'>) => {
		this.status = status;
		pubsub.publish(TopicNames.ScriptStatus, {
			path: this.shortPath,
			status,
		});
	};

	finalize = (exitCode: number, error?: any) => {
		if (error) {
			this.appendOutput({ type: 'stderr', line: String(error) });
		}
		this.appendOutput({ type: 'exit', code: exitCode });
		this.setStatus('exited');
		activeScripts.delete(this.shortPath);
	};

	run = () => {
		const proc = Bun.spawn([this.fullPath], {
			signal: this.controller.signal,
			stdio: ['ignore', 'pipe', 'pipe'],
			onExit: (_subprocess, exitCode, _signalCode, error) => {
				if (this.controller.signal.aborted) {
					exitCode = SpecialExitCodes.Aborted;
				}
				this.finalize(exitCode || 0, error);
			},
		});

		this.setStatus('started');

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

const activeScripts = new Map<string, ScriptRunner>();

export const abortScript = (path: string) => {
	const runner = activeScripts.get(path);

	if (!runner) {
		throw Error(`No active script with path: ${path}`);
	}

	runner.controller.abort();
	return runner.controller.signal.aborted;
};

export const runScript = (path: string) => {
	const runner = new ScriptRunner(path);
	runner.run();
	return runner.status === 'started';
};
