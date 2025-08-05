import { Header } from 'src/App/Header';
import { Main } from 'src/App/Main';
import { Sidebar } from 'src/App/Sidebar';

import { Section } from '@/components/Section';

import { cls } from './App.styles';

export const App: React.FC = () => {
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
