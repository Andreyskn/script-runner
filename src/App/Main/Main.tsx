import { Scripts } from 'src/views/Scripts';
import { cls } from './Main.styles';

export type MainProps = {
	className?: string;
};

export const Main: React.FC<MainProps> = (props) => {
	const { className } = props;

	return (
		<div className={cls.main.block(null, className)}>
			<Scripts />
		</div>
	);
};
