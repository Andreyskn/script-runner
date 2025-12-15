import { useEffect } from 'react';

import { search } from '@/components/Search';
import { Section } from '@/components/Section';

import { Header } from 'src/App/Header';
import { Main } from 'src/App/Main';
import { Sidebar } from 'src/App/Sidebar';

import { cls } from './App.styles';

export const App: React.FC = () => {
	useEffect(() => {
		window.electronAPI?.onShowSearch(search.show);
	}, []);

	if (window.electronAPI?.searchOnly) {
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
