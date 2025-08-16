import { useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Fuse from 'fuse.js';
import { FileTextIcon, PlayIcon } from 'lucide-react';

import { Combobox, type ComboboxOption } from '@/components/Combobox';

import { cls } from './Search.styles';

// TODO: highlight matching characters

type SearchOption = ComboboxOption<{
	name: string;
	dir: string;
}>;

const options: SearchOption[] = [
	{ name: 'backup.sh', dir: 'automation', value: 'automation/backup.sh' },
	{ name: 'deploy.sh', dir: 'automation', value: 'automation/deploy.sh' },
	{
		name: 'health-check.sh',
		dir: 'monitoring',
		value: 'monitoring/health-check.sh',
	},
	{ name: 'cleanup.sh', dir: 'utilities', value: 'utilities/cleanup.sh' },
];

const NO_RESULTS: SearchOption[] = [
	{
		dir: '',
		name: '',
		value: '',
	},
];

const fuse = new Fuse(options, {
	keys: [
		{ name: 'name', weight: 0.9 },
		{ name: 'value', weight: 0.1 },
	],
	includeScore: true,
	findAllMatches: true,
	includeMatches: true,
	threshold: 0.65,
});

export type SearchProps = {};

export const Search: React.FC<SearchProps> = (props) => {
	const {} = props;

	const [results, setResults] = useState<SearchOption[]>(options);

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

	const renderOption = (option: SearchOption) => {
		if (!option.value) {
			return <div>No matching results</div>;
		}

		return (
			<div className={cls.option.block({ compact: true })}>
				<FileTextIcon size={16} className={cls.option.icon()} />
				<div className={cls.option.name()}>{option.name}</div>
				<div className={cls.option.dir()}>{option.dir}</div>
				{false && <PlayIcon size={16} className={cls.option.play()} />}
			</div>
		);
	};

	const handleInputChange = (value: string) => {
		if (value === '') {
			setResults(options);
		} else {
			const searchResults = fuse.search(value);
			setResults(searchResults.map((result) => result.item));
		}
	};

	const handleSelect = (path: SearchOption['path']) => {
		if (!path) {
			return;
		}

		console.log(path);
		dialogRef.current?.close();
	};

	const handleClose = () => {
		const input = inputRef.current;
		if (input) {
			input.value = '';
		}
		setResults(options);
	};

	return (
		<dialog
			// @ts-expect-error
			closedby='any'
			ref={dialogRef}
			className={cls.dialog.block()}
			onClose={handleClose}
		>
			<Combobox
				selectRef={selectRef}
				inputRef={inputRef}
				selectClassName={cls.search.select()}
				placeholder='Search scripts...'
				options={results.length ? results : NO_RESULTS}
				renderOption={(opt) => renderOption(opt as SearchOption)}
				onInputChange={handleInputChange}
				onSelect={handleSelect}
			/>
		</dialog>
	);
};
