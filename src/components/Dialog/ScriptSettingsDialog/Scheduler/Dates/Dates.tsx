import { cls } from './Dates.styles';

export type DatesProps = {};

export const Dates: React.FC<DatesProps> = (props) => {
	const {} = props;

	return <div className={cls.dates.block()}>Dates</div>;
};
