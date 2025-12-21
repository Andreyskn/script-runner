import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Fuse from 'fuse.js';
import { FileTextIcon, PlayIcon } from 'lucide-react';

import { ipc } from '@/api';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { FilesStore } from '@/views/Scripts/stores/filesStore';

import { cls } from './Search.styles';

// TODO: highlight matching characters

type SearchOption = ComboboxOption<{
	name: string;
	dir: string;
}>;

const NO_RESULTS: SearchOption[] = [
	{
		dir: '',
		name: '',
		value: '',
	},
];

type SearchAPI = {
	show: () => void;
};

export const search: SearchAPI = {
	show: () => null as any,
};

export type SearchProps = {};

export const Search: React.FC<SearchProps> = (props) => {
	const {} = props;

	const { useSelector, setSelectedScript } = FilesStore.use();

	const { options, fuse } = useSelector(
		(state) => state.files,
		(files) => {
			// TODO: sort options

			const options: SearchOption[] = [...files]
				.filter((path) => path.endsWith('.sh'))
				.map((path) => {
					const segments = path.split('/');
					const name = segments.at(-1)!;
					const dir =
						segments.length > 1
							? segments.slice(0, -1).join('/')
							: '';

					return { name, dir, value: path };
				});

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

			return { options, fuse };
		}
	);

	const [results, setResults] = useState<SearchOption[]>(options);

	useEffect(() => setResults(options), [options]);

	const showSearch = () => {
		dialogRef.current?.showModal();
		inputRef.current?.focus();
	};

	useEffect(() => {
		Object.assign(search, {
			show: showSearch,
		} satisfies SearchAPI);
	}, []);

	const dialogRef = useRef<HTMLDialogElement>(null);
	const selectRef = useRef<HTMLSelectElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useHotkeys('ctrl+p', showSearch, {
		preventDefault: true,
		enableOnFormTags: true,
	});

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

	const handleSelect = (path: string) => {
		if (!path) {
			return;
		}

		ipc.send.endSearch(path);

		setSelectedScript(path);
		dialogRef.current?.close();
	};

	const handleClose = () => {
		ipc.send.endSearch();

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
			className={cls.dialog.block({
				standalone: ipc.config?.searchOnly,
			})}
			onClose={handleClose}
			onCancel={handleClose}
		>
			<Combobox
				selectRef={selectRef}
				inputRef={inputRef}
				selectClassName={cls.search.select()}
				placeholder='Search scripts... (Tab ↑↓ to navigate)'
				options={results.length ? results : NO_RESULTS}
				renderOption={(opt) => renderOption(opt as SearchOption)}
				onInputChange={handleInputChange}
				onSelect={handleSelect}
			/>
		</dialog>
	);
};
