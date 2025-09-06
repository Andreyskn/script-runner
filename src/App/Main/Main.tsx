import { History } from '@/views/History';
import { Scripts } from '@/views/Scripts';

import { AppStore } from 'src/App/appStore';

import { cls } from './Main.styles';

export type MainProps = {
	className?: string;
};

export const Main: React.FC<MainProps> = (props) => {
	const { className } = props;
	const {
		selectors: { view },
	} = AppStore.use();

	const views: Record<typeof view, React.ReactNode> = {
		get scripts() {
			return <Scripts />;
		},
		get history() {
			return <History />;
		},
	};

	return <div className={cls.main.block(null, className)}>{views[view]}</div>;
};
