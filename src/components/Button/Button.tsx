import { cls } from './Button.styles';

export type ButtonProps = {};

export const Button: React.FC<ButtonProps> = (props) => {
	const {} = props;

	return <div className={cls.button.block()}>Button</div>;
};
