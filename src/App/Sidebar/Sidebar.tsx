import { Button } from '@/components/Button';
import { archiveStore } from '@/views/History/archiveStore';

import { appStore } from 'src/App/appStore';

import { cls } from './Sidebar.styles';

export type SidebarProps = {
	className?: string;
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const { className } = props;
	const {
		selectors: { view },
		setView,
	} = appStore;

	const {
		useSelector,
		selectors: { unseenCount },
	} = archiveStore;

	const activeCount = useSelector(
		(state) => state.active,
		(set) => set.size
	);

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
					icon='terminal'
					text='Active'
					fill={view === 'active' ? 'green' : 'none'}
					borderless={view !== 'active'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('active')}
					badge={activeCount || undefined}
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
					badge={unseenCount || undefined}
				/>
			</div>
		</div>
	);
};
