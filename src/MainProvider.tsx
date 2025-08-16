import { ContextMenu } from '@/components/ContextMenu';
import { Search } from '@/components/Search';

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

			{children}
		</>
	);
};
