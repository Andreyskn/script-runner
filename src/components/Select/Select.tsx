import { ChevronDownIcon } from 'lucide-react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

import { Button } from '@/components/Button';

import { cls } from './Select.styles';

export type Option = {
	text: string;
	icon?: IconName;
	value?: string | number;
	selected?: boolean;
} & Record<string, unknown>;

export type SelectProps = {
	name: string;
	options: Option[];
	customToggle?: boolean;
	className?: string;
	ref?: React.RefObject<HTMLSelectElement | null>;
	tabIndex?: number;
	renderOption?: (option: Option) => React.ReactNode;
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
	} = props;

	return (
		<select
			ref={ref}
			name={name}
			tabIndex={tabIndex}
			className={cls.select.block(null, className)}
			onKeyDown={onKeyDown}
			onChange={(ev) => {
				console.log('change', ev.target.value);
			}}
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
				<option key={i} value={opt.value} selected={opt.selected}>
					<div className={cls.select.optionContent()}>
						{renderOption ? (
							renderOption(opt)
						) : (
							<>
								{opt.icon && (
									<DynamicIcon name={opt.icon} size={16} />
								)}
								{opt.text}
							</>
						)}
					</div>
				</option>
			))}
		</select>
	);
};
