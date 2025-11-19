import { http, HttpResponse } from 'msw';

import { sleep } from '@/utils';

const url = (route: string) => `http://localhost:3001/api/${route}`;

export const handlers = [
	http.get(url('file/list'), () => {
		return HttpResponse.json({
			files: ['folder/long-running.sh', 'demo.sh'],
		});
	}),
	http.get(url('script'), () => HttpResponse.text('123')),
	http.get(url('script/run'), ({ request }) => {
		const path = URL.parse(request.url)?.searchParams?.get('path');

		return new HttpResponse(
			new ReadableStream({
				start: async (controller) => {
					const encoder = new TextEncoder();

					const write = (text: string, type = 'data') => {
						controller.enqueue(
							encoder.encode(`${type}: ${text}\n\n`)
						);
					};

					write('start', 'event');

					const echo = (line: string, isError = false) => {
						write(JSON.stringify({ isDone: false, isError, line }));
					};

					const exit = (code = 0) => {
						write(JSON.stringify({ isDone: true, code }));
						controller.close();
					};

					if (path?.endsWith('long-running.sh')) {
						while (true) {
							echo(new Date().toString());
							await sleep(1000);
						}
					} else {
						echo('123');
						exit(1);
					}
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
