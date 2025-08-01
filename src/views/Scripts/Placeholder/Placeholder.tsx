import { cls } from './Placeholder.styles';

export type PlaceholderProps = {};

export const Placeholder: React.FC<PlaceholderProps> = (props) => {
	const {} = props;

	return <div className={cls.placeholder.block()}></div>;
};
