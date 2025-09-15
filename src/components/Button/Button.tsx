import { LoaderCircle } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

import { cls } from './Button.styles';

type ButtonAttributes = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = NonRenderableOptions<{
	icon?: IconName | React.ReactElement;
	iconEnd?: IconName | React.ReactNode;
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
	layout?: 'horizontal' | 'vertical';
	textClassName?: string;
}> &
	ButtonAttributes;

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
		layout,
		textClassName,
		iconEnd,
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
					vertical: layout === 'vertical',
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
							<div className={cls.button.icon()}>
								{typeof icon === 'string' ? (
									<DynamicIcon
										name={icon as IconName}
										size={16}
									/>
								) : (
									icon
								)}
							</div>
						)}
						{text && (
							<span
								className={cls.button.text(null, textClassName)}
							>
								{text}
							</span>
						)}
						{iconEnd && (
							<div className={cls.button.icon()}>
								{typeof iconEnd === 'string' ? (
									<DynamicIcon
										name={iconEnd as IconName}
										size={16}
									/>
								) : (
									iconEnd
								)}
							</div>
						)}
					</>
				))}
		</button>
	);
};
