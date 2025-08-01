import { cls } from './Sidebar.styles';

export type SidebarProps = {
	className?: string;
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const { className } = props;

	return (
		<div className={cls.sidebar.block(null, className)}>
			<div className={cls.sidebar.nav()}></div>
		</div>
	);
};
