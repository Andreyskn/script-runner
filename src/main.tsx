import { createRoot } from 'react-dom/client';

// import { worker } from '@/mocks/worker';

import { App } from 'src/App';
import { MainProvider } from 'src/MainProvider';

// await worker.start();

createRoot(document.getElementById('root')!).render(
	<MainProvider>
		<App />
	</MainProvider>
);
