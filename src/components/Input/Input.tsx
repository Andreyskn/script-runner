import { cls } from './Input.styles';

export type InputProps = {
	icon?: Icon;
	className?: string;
	wrapperClassName?: string;
	ref?: React.RefObject<HTMLInputElement | null>;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
	const { icon, className, wrapperClassName, ref, ...attrs } = props;

	return (
		<div className={cls.wrapper.block(null, wrapperClassName)}>
			{icon}
			<input
				ref={ref}
				{...attrs}
				className={cls.input.block({ withIcon: !!icon }, className)}
			/>
		</div>
	);
};
