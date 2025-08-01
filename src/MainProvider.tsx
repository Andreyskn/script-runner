import { ContextMenu } from '@/components/ContextMenu';
import 'modern-normalize/modern-normalize.css';
import './styles/global.scss';
import './styles/vars.css';

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<>
			<ContextMenu />
			{children}
		</>
	);
};
