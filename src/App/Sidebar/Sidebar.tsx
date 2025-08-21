import { Button } from '@/components/Button';

import { AppStore } from 'src/App/appStore';

import { cls } from './Sidebar.styles';

export type SidebarProps = {
	className?: string;
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const { className } = props;
	const {
		selectors: { view },
		setView,
	} = AppStore.use();

	return (
		<div className={cls.sidebar.block(null, className)}>
			<div className={cls.sidebar.nav()}>
				<Button
					layout='vertical'
					icon='code-xml'
					text='Scripts'
					fill={view === 'scripts' ? 'green' : 'none'}
					borderless={view !== 'scripts'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('scripts')}
				/>
				<Button
					layout='vertical'
					icon='history'
					text='History'
					fill={view === 'history' ? 'green' : 'none'}
					borderless={view !== 'history'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('history')}
				/>
			</div>
		</div>
	);
};
