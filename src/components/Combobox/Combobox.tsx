import { useEffect, useRef } from 'react';

import { Input, type InputProps } from '@/components/Input';
import { Select, type SelectProps } from '@/components/Select';
import { useUpdate } from '@/utils';

import { cls } from './Combobox.styles';

export type ComboboxProps = {
	inputRef?: InputProps['ref'];
	selectRef?: SelectProps['ref'];
	selectClassName?: string;
	placeholder?: string;
} & Pick<InputProps, 'placeholder' | 'name'>;

type ComboboxOption = {
	name: string;
};

export const Combobox: React.FC<ComboboxProps> = (props) => {
	const {
		selectRef = useRef(null),
		inputRef = useRef(null),
		selectClassName,
		placeholder,
		name,
	} = props;

	const { update } = useUpdate();
	const key = useRef(0);

	useEffect(() => {
		try {
			selectRef.current?.showPicker();
		} catch (error) {}
	}, [key.current]);

	return (
		<div className={cls.combobox.block()}>
			<Input
				ref={inputRef}
				icon='search'
				name='qwe'
				placeholder={placeholder}
				wrapperClassName={cls.combobox.input()}
				onChange={() => {
					try {
						selectRef.current?.showPicker();
						inputRef.current?.focus();
					} catch (error) {}
				}}
				onClick={() => {
					try {
						selectRef.current?.showPicker();
						inputRef.current?.focus();
					} catch (error) {}
				}}
				onFocus={() => {
					try {
						selectRef.current?.showPicker();
						inputRef.current?.focus();
					} catch (error) {}
				}}
				onKeyDown={(ev) => {
					if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
						key.current++;
						update();
					} else if (ev.key === 'Tab') {
						ev.preventDefault();
					}
				}}
			/>
			<Select
				key={key.current}
				tabIndex={-1}
				customToggle
				ref={selectRef}
				name='asd'
				options={[
					{ text: 'automation' },
					{ text: 'monitoring' },
					{ text: 'utilities' },
				]}
				className={cls.combobox.select(null, selectClassName)}
				onKeyDown={(ev) => {
					if (ev.key.length === 1) {
						inputRef.current?.focus();
					} else if (ev.key === 'Tab') {
						ev.preventDefault();
						ev.stopPropagation();
						inputRef.current?.focus();
					} else if (
						ev.key === 'ArrowRight' ||
						ev.key === 'ArrowLeft'
					) {
						ev.preventDefault();
					}
				}}
			/>
		</div>
	);
};
