import { Button } from '@/components/Button';

import { cls } from './Sidebar.styles';

export type SidebarProps = {
	className?: string;
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
	const { className } = props;

	return (
		<div className={cls.sidebar.block(null, className)}>
			<div className={cls.sidebar.nav()}>
				<Button
					layout='vertical'
					icon='code-xml'
					text='Scripts'
					fill='green'
					className={cls.sidebar.navButton()}
				/>
				<Button
					layout='vertical'
					icon='history'
					text='History'
					borderless
					className={cls.sidebar.navButton()}
				/>
			</div>
		</div>
	);
};
