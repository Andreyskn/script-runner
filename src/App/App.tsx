import { useEffect } from 'react';

import { ipc } from '@/api';
import { search } from '@/components/Search';
import { Section } from '@/components/Section';

import { cls } from './App.styles';
import { appStore } from './appStore';
import { Header } from './Header';
import { Main } from './Main';
import { Sidebar } from './Sidebar';

export const App: React.FC = () => {
	useEffect(() => {
		if (!ipc.available) {
			return;
		}

		const { windowId } = ipc.config!;

		if (windowId === 'search') {
			search.show();
		}

		if (windowId === 'main') {
			ipc.handle.setView((view) => {
				appStore.setView(view);
			});
		}

		ipc.call.appReady(windowId);
	}, []);

	if (ipc.config?.windowId === 'search') {
		return null;
	}

	return (
		<Section
			header={<Header />}
			className={cls.app.block()}
			contentClassName={cls.app.content()}
			noContentPadding
		>
			<Sidebar className={cls.app.sidebar()} />
			<Main className={cls.app.main()} />
		</Section>
	);
};
