import { LoaderCircle } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { cls } from './Button.styles';

type ButtonAttributes = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = {
	icon?: IconName;
	color?: 'none' | 'green' | 'red';
	fill?: 'none' | 'green' | 'red';
	text?: string;
	stretch?: boolean;
	size?: 'medium' | 'large' | 'small';
	minimal?: boolean;
	round?: boolean;
	loading?: boolean;
	borderless?: boolean;
	align?: 'left' | 'right' | 'center';
} & ButtonAttributes;

export const Button: React.FC<ButtonProps> = (props) => {
	const {
		text,
		minimal,
		className,
		round,
		color,
		fill,
		icon,
		size,
		stretch,
		children,
		loading,
		borderless,
		align,
		...attrs
	} = props;

	return (
		<button
			{...attrs}
			className={cls.button.block(
				{
					fillRed: fill === 'red',
					fillGreen: fill === 'green',
					colorRed: color === 'red',
					colorGreen: color === 'green',
					large: size === 'large',
					small: size === 'small',
					alignLeft: align === 'left',
					alignRight: align === 'right',
					stretch,
					minimal,
					round,
					borderless,
				},
				className
			)}
		>
			{children ??
				(loading ? (
					<LoaderCircle size={16} className={cls.button.loader()} />
				) : (
					<>
						{icon && (
							<DynamicIcon
								name={icon}
								size={16}
								className={cls.button.icon()}
							/>
						)}
						<span className={cls.button.text()}>{text}</span>
					</>
				))}
		</button>
	);
};
