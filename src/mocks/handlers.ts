import {
	http,
	HttpResponse,
	type DefaultBodyType,
	type StrictRequest,
} from 'msw';
import { parse } from 'shell-quote';

import { sleep } from '@/utils';

import { files, newScriptText } from './mocks';

const url = (route: string) => `http://localhost:3001/api/${route}`;

const getScriptPath = (request: StrictRequest<DefaultBodyType>) => {
	return URL.parse(request.url)?.searchParams?.get('path') || '';
};

const getScriptName = (request: StrictRequest<DefaultBodyType>) => {
	return getScriptPath(request).split('/').pop() || '';
};

const timestamp = () =>
	new Date()
		.toString()
		.replace(/GMT.*$/, '')
		.trim();

const scripts = new Map<
	string,
	{
		promise: Promise<string>;
		resolve: (text: string) => void;
	}
>();

const mockChannel = new BroadcastChannel('script-runner-mock');

mockChannel.addEventListener('message', (event) => {
	if (event.data.type === 'SCRIPT_TEXT') {
		const { path, text } = event.data as { text: string; path: string };
		scripts.get(path)!.resolve(text);
	}
});

const encoder = new TextEncoder();

export const handlers = [
	http.get(url('file/list'), () => {
		return HttpResponse.json({
			files: files
				.map((f) => f.name)
				.concat(files.map((f) => `folder/${f.name}`)),
		});
	}),
	http.get(url('script'), ({ request }) => {
		const name = getScriptName(request);
		const text = files.find((f) => f.name === name)?.text || newScriptText;
		return HttpResponse.text(text);
	}),
	http.get(url('script/run'), async ({ request }) => {
		const path = getScriptPath(request);
		scripts.set(path, Promise.withResolvers());

		return new HttpResponse(
			new ReadableStream({
				start: async (controller) => {
					const write = (text: string, type = 'data') => {
						controller.enqueue(
							encoder.encode(`${type}: ${text}\n\n`)
						);
					};

					write('start', 'event');

					const commands = {
						echo: (line: string, isError = false) => {
							line.split('\\n').forEach((line) => {
								write(
									JSON.stringify({
										isDone: false,
										isError,
										line,
									})
								);
							});
						},
						error: (line: string) => commands.echo(line, true),
						date: () => commands.echo(timestamp()),
						sleep: async (seconds: string) => {
							const number = Number(seconds);
							if (Number.isFinite(number) && number >= 0) {
								await sleep(number * 1000);
							} else {
								commands.error(
									`sleep: invalid time interval '${seconds}'`
								);
							}
						},
						exit: (code: number) => {
							write(JSON.stringify({ isDone: true, code }));
							controller.close();
						},
					};

					const text = await scripts.get(path)!.promise;
					const lines = text.split('\n');

					for (const line of lines) {
						const [cmd, ...args] = parse(line);

						if (typeof cmd !== 'string' || !(cmd in commands)) {
							continue;
						}

						await commands[cmd as keyof typeof commands](
							args.join(' ') as never
						);

						if (cmd === 'exit') {
							return;
						}
					}

					commands.exit(0);
				},
			}),
			{
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
				},
			}
		);
	}),

	http.post(url('file/move'), () => new HttpResponse(null, { status: 200 })),
	http.post(url('file'), () => new HttpResponse(null, { status: 200 })),
	http.delete(url('file'), () => new HttpResponse(null, { status: 200 })),
	http.post(url('script'), () => new HttpResponse(null, { status: 200 })),
];
