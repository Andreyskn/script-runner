import { CodeXml, HistoryIcon, TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { useBreakpoint } from '@/utils';
import { archiveStore } from '@/views/History/archiveStore';
import { appStore } from 'src/App/appStore';

import { cls } from './Sidebar.styles';

export type SidebarProps = {
	className?: string;
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const { className } = props;
	const { mobileScreen } = useBreakpoint();
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
					layout={mobileScreen ? 'horizontal' : 'vertical'}
					icon={<CodeXml />}
					text='Scripts'
					fill={view === 'scripts' ? 'green' : 'none'}
					borderless={view !== 'scripts'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('scripts')}
					stretch={mobileScreen}
				/>
				<Button
					layout={mobileScreen ? 'horizontal' : 'vertical'}
					icon={<TerminalIcon />}
					text='Active'
					fill={view === 'active' ? 'green' : 'none'}
					borderless={view !== 'active'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('active')}
					badge={activeCount || undefined}
					stretch={mobileScreen}
				/>
				<Button
					layout={mobileScreen ? 'horizontal' : 'vertical'}
					icon={<HistoryIcon />}
					text='History'
					fill={view === 'history' ? 'green' : 'none'}
					borderless={view !== 'history'}
					className={cls.sidebar.navButton()}
					textClassName={cls.sidebar.navButtonText()}
					onClick={() => setView('history')}
					badge={unseenCount || undefined}
					stretch={mobileScreen}
				/>
			</div>
		</div>
	);
};
