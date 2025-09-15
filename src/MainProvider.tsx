import { ContextMenu } from '@/components/ContextMenu';
import { Dialog } from '@/components/Dialog';
import { Search } from '@/components/Search';
import { TooltipPopover } from '@/components/Tooltip';

import './styles/global.scss';
import './styles/vars.css';
import 'modern-normalize/modern-normalize.css';

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<>
			<ContextMenu />
			<Search />
			<TooltipPopover />
			<Dialog />

			{children}
		</>
	);
};
