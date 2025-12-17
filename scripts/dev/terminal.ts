import type { SpawnOptions } from 'bun';
import { parse } from 'shell-quote';

import { prompt } from './prompt';

export const log = (id: string, text: string) => {
	prompt.hide();
	console.log(`[${id}]:\n${text}`);
	prompt.show();
};

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

	const reader = proc.stdout.getReader();

	(async () => {
		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				log(id, new TextDecoder().decode(value));
			}
		} finally {
			reader.releaseLock();
		}
	})();

	return proc;
};
