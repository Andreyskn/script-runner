import type { SpawnOptions, Subprocess } from 'bun';
import { parse } from 'shell-quote';

import { ipc } from './ipc';
import { prompt } from './prompt';

export const print = (id: string, text: string) => {
	prompt.hide();
	console.log(`[${id}]:\n${text}`);
	prompt.show();
};

const procs: Set<Subprocess> = new Set();

export const cleanup = () => {
	procs.forEach((p) => p.kill());
};

const decoder = new TextDecoder();

export const spawn = (
	id: string,
	cmd: string,
	options?: SpawnOptions.OptionsObject<'ignore', 'pipe', 'inherit'>
) => {
	const args = parse(cmd).map((entry): string => {
		if (typeof entry === 'string') {
			return entry;
		}
		if ('op' in entry) {
			return entry.op === 'glob' ? entry.pattern : entry.op;
		}
		if ('comment' in entry) {
			return entry.comment;
		}
		return String(entry);
	});

	const proc = Bun.spawn(args, {
		stdin: 'ignore',
		stdout: 'pipe',
		stderr: 'inherit',
		...options,
	});

	procs.add(proc);

	const reader = proc.stdout.getReader();

	(async () => {
		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const text = decoder.decode(value);

				if (id === 'vite' && text.includes('Could not Fast Refresh')) {
					ipc.debounceSend('refresh');
					continue;
				}

				print(id, text);
			}
		} finally {
			reader.releaseLock();
			procs.delete(proc);
		}
	})();

	return proc;
};
