import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

import { cls } from './Input.styles';

export type InputProps = {
	icon?: IconName;
	className?: string;
	wrapperClassName?: string;
	ref?: React.RefObject<HTMLInputElement | null>;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
	const { icon, className, wrapperClassName, ref, ...attrs } = props;

	return (
		<div className={cls.wrapper.block(null, wrapperClassName)}>
			{icon && (
				<DynamicIcon
					name={icon}
					size={16}
					className={cls.icon.block()}
				/>
			)}
			<input
				ref={ref}
				{...attrs}
				className={cls.input.block({ withIcon: !!icon }, className)}
			/>
		</div>
	);
};
