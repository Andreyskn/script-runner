import { LoaderCircle } from 'lucide-react';

import { cls } from './Button.styles';

type ButtonAttributes = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = NonRenderableOptions<{
	icon?: Icon;
	iconEnd?: Icon;
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
	badge?: string | number;
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
		badge,
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
			{badge !== undefined && (
				<div className={cls.button.badge()}>{badge}</div>
			)}
			{children ??
				(loading ? (
					<LoaderCircle size={16} className={cls.button.loader()} />
				) : (
					<>
						{icon && (
							<div className={cls.button.icon()}>{icon}</div>
						)}
						{text && (
							<span
								className={cls.button.text(null, textClassName)}
							>
								{text}
							</span>
						)}
						{iconEnd && (
							<div className={cls.button.icon()}>{iconEnd}</div>
						)}
					</>
				))}
		</button>
	);
};
