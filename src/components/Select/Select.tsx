import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/Button';

import { cls } from './Select.styles';

export type SelectOption<
	T extends Record<string, unknown> = Record<string, any>,
> = T & {
	text?: string;
	icon?: Icon;
	value?: string | number;
	selected?: boolean;
} & Record<string, unknown>;

export type SelectProps = {
	name: string;
	options: SelectOption[];
	customToggle?: boolean;
	className?: string;
	ref?: React.RefObject<HTMLSelectElement | null>;
	tabIndex?: number;
	renderOption?: (option: SelectOption) => React.ReactNode;
	onSelect?: (value: string) => void;
} & Pick<React.DOMAttributes<HTMLSelectElement>, 'onKeyDown'>;

export const Select: React.FC<SelectProps> = (props) => {
	const {
		name,
		options,
		className,
		ref,
		customToggle,
		tabIndex,
		onKeyDown,
		renderOption,
		onSelect,
	} = props;

	return (
		<select
			ref={ref}
			name={name}
			tabIndex={tabIndex}
			className={cls.select.block(null, className)}
			onKeyDown={onKeyDown}
			onChange={(ev) => onSelect?.(ev.target.value)}
		>
			{!customToggle && (
				<Button
					borderless
					stretch
					className={cls.select.picker()}
					align='left'
				>
					{/* @ts-expect-error */}
					<selectedcontent />
					<ChevronDownIcon
						size={16}
						className={cls.select.chevron()}
					/>
				</Button>
			)}
			{options.map((opt, i) => (
				<option
					key={i}
					value={opt.value}
					selected={opt.selected}
					className={cls.select.option()}
					onMouseUp={(e) => {
						e.preventDefault();
						onSelect?.(e.currentTarget.value);
					}}
				>
					{renderOption ? (
						renderOption(opt)
					) : (
						<div className={cls.select.optionContent()}>
							{opt.icon}
							<div className={cls.select.optionText()}>
								{opt.text}
							</div>
						</div>
					)}
				</option>
			))}
		</select>
	);
};
