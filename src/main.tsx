import { createRoot } from 'react-dom/client';

import { App } from 'src/App';
import { MainProvider } from 'src/MainProvider';

if (import.meta.env.MODE === 'mock') {
	const { worker } = await import('@/mocks/worker');

	await worker.start();
}

createRoot(document.getElementById('root')!).render(
	<MainProvider>
		<App />
	</MainProvider>
);
