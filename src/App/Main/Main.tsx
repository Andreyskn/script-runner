import { History } from '@/views/History';

import { cls } from './Main.styles';

export type MainProps = {
	className?: string;
};

export const Main: React.FC<MainProps> = (props) => {
	const { className } = props;

	return (
		<div className={cls.main.block(null, className)}>
			<History />
			{/* <Scripts /> */}
		</div>
	);
};
