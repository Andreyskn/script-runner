import { useRef } from 'react';

import { cls } from './Input.styles';

export type InputProps = {
	icon?: Icon;
	className?: string;
	wrapperClassName?: string;
	ref?: React.RefObject<HTMLInputElement | null>;
	type?: React.HTMLInputTypeAttribute | 'integer' | 'float';
	size?: 'medium' | 'small';
} & OmitType<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const Input: React.FC<InputProps> = (props) => {
	const { icon, className, wrapperClassName, ref, type, size, ...attrs } =
		props;

	const lastValue = useRef('');

	return (
		<div className={cls.wrapper.block(null, wrapperClassName)}>
			{icon}
			<input
				ref={ref}
				type={type}
				{...attrs}
				className={cls.input.block(
					{ withIcon: !!icon, small: size === 'small' },
					className
				)}
				onInput={({ currentTarget }) => {
					const { value } = currentTarget;

					if (type === 'integer' && value) {
						const int = parseInt(value, 10);

						currentTarget.value = String(
							Number.isNaN(int) ? '' : int
						);
					} else if (type === 'float') {
						if (value.startsWith('.')) {
							currentTarget.value = '0.';
							lastValue.current = '0.';
							return;
						}

						if (!value || /^\d*\.?\d{0,3}$/.test(value)) {
							lastValue.current = value;
						}
						currentTarget.value = lastValue.current;
					}
				}}
			/>
		</div>
	);
};
