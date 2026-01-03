import { createRoot } from 'react-dom/client';

import { App } from 'src/App';
import { MainProvider } from 'src/MainProvider';

if (import.meta.env.DEV) {
	const originalError = console.error;
	console.error = function (...args) {
		if (
			typeof args[0] === 'string' &&
			args[0].startsWith('In HTML, %s cannot be a child of <%s>') &&
			args[1] === '<div>' &&
			args[2] === 'option'
		) {
			return;
		}
		originalError.apply(console, args);
	};
}

createRoot(document.getElementById('root')!).render(
	<MainProvider>
		<App />
	</MainProvider>
);
