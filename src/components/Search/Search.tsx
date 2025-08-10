import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Combobox } from '@/components/Combobox';

import { cls } from './Search.styles';

export type SearchProps = {};

export const Search: React.FC<SearchProps> = (props) => {
	const {} = props;
	const dialogRef = useRef<HTMLDialogElement>(null);
	const selectRef = useRef<HTMLSelectElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useHotkeys(
		'ctrl+p',
		() => {
			dialogRef.current?.showModal();
			inputRef.current?.focus();
		},
		{
			preventDefault: true,
			enableOnFormTags: true,
		}
	);

	useHotkeys(
		'esc',
		() => {
			dialogRef.current?.close();
		},
		{
			enableOnFormTags: true,
		}
	);

	return (
		<dialog
			// @ts-expect-error
			closedby='any'
			ref={dialogRef}
			className={cls.dialog.block()}
			onClose={() => {
				const input = inputRef.current;
				if (input) {
					input.value = '';
				}
			}}
		>
			<Combobox
				selectRef={selectRef}
				inputRef={inputRef}
				selectClassName={cls.search.select()}
				placeholder='Search scripts...'
			/>
		</dialog>
	);
};
