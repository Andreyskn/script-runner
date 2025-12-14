import { useEffect, useRef } from 'react';

import { Input, type InputProps } from '@/components/Input';
import {
	Select,
	type SelectOption,
	type SelectProps,
} from '@/components/Select';
import { useUpdate } from '@/utils';

import { cls } from './Combobox.styles';

export type ComboboxOption<T extends Record<string, unknown> = {}> =
	SelectOption<T>;

export type ComboboxProps = {
	inputRef?: InputProps['ref'];
	selectRef?: SelectProps['ref'];
	selectClassName?: string;
	placeholder?: string;
	options: ComboboxOption[];
	renderOption?: (option: ComboboxOption) => React.ReactNode;
	onInputChange?: (value: string) => void;
	onSelect?: SelectProps['onSelect'];
} & Pick<InputProps, 'placeholder' | 'name'>;

export const Combobox: React.FC<ComboboxProps> = (props) => {
	const {
		selectRef = useRef(null),
		inputRef = useRef(null),
		selectClassName,
		placeholder,
		name,
		renderOption,
		options,
		onInputChange,
		onSelect,
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
				name={name}
				placeholder={placeholder}
				wrapperClassName={cls.combobox.input()}
				onChange={(ev) => {
					try {
						selectRef.current?.showPicker();
						inputRef.current?.focus();
					} catch (error) {}

					onInputChange?.(ev.target.value);
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
					// TODO: https://www.npmjs.com/package/ts-key-enum
					const navKeys: string[] = ['ArrowDown', 'ArrowUp', 'Tab'];

					if (navKeys.includes(ev.key)) {
						ev.preventDefault();
						key.current++;
						update();
					}
				}}
			/>
			<Select
				key={key.current}
				tabIndex={-1}
				customToggle
				ref={selectRef}
				name='_'
				options={options}
				renderOption={renderOption}
				className={cls.combobox.select(null, selectClassName)}
				onSelect={onSelect}
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
					} else if (ev.key === 'Enter') {
						ev.preventDefault();
						onSelect?.((ev.target as any).value);
					}
				}}
			/>
		</div>
	);
};
