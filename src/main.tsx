import { ContextMenu } from '@/components/ContextMenu';
import 'modern-normalize/modern-normalize.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'src/App';
import './styles/global.scss';
import './styles/vars.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ContextMenu />
		<App />
	</StrictMode>
);
