import { abs } from './common';
import { pubsub } from './pubsub';
import {
	SpecialExitCodes,
	type RawScriptOutput,
	type ScriptOutput,
} from './types';

export const activeScripts = new Map<string, ScriptRunner>();

export type ScriptStatus = 'idle' | 'running' | 'ended';

export class ScriptRunner {
	controller = new AbortController();
	output: ScriptOutput[] = [];
	status: ScriptStatus = 'idle';
	fullPath: string;

	constructor(public shortPath: string) {
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
		pubsub.publish(`output:${this.shortPath}`, { output });
	};

	setStatus = (status: Exclude<ScriptStatus, 'idle'>) => {
		this.status = status;
		pubsub.publish('script-status', {
			path: this.shortPath,
			status,
			timestamp: new Date().toISOString(),
		});
	};

	finalize = (exitCode: number, error?: any) => {
		if (error) {
			this.appendOutput({ type: 'stderr', line: String(error) });
		}
		this.appendOutput({ type: 'exit', code: exitCode });
		this.setStatus('ended');
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
