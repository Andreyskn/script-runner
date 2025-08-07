import { createRoot } from 'react-dom/client';

import { App } from 'src/App';
import { MainProvider } from 'src/MainProvider';

createRoot(document.getElementById('root')!).render(
	<MainProvider>
		<App />
	</MainProvider>
);
