import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Fuse from 'fuse.js';
import { FileTextIcon } from 'lucide-react';

import { appStore } from '@/App/appStore';
import { api, ipc } from '@/api';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { filesStore } from '@/views/Scripts/stores/filesStore';

import { cls } from './Search.styles';
import { search, type SearchAPI } from './searchApi';

// TODO: highlight matching characters

type SearchOption = ComboboxOption<{
	name: string;
	dir: string;
}>;

const NO_RESULTS: SearchOption[] = [
	{
		dir: '',
		name: '',
		value: 'NO_RESULT',
	},
];

export type SearchProps = {};

export const Search: React.FC<SearchProps> = () => {
	const { useSelector, setSelectedScript } = filesStore;

	const { options, fuse } = useSelector(
		(state) => state.files,
		(files) => {
			// TODO: sort options

			const options: SearchOption[] = [...files.values()]
				.filter(({ type }) => type === 'script')
				.map(({ path, id, name }) => {
					const segments = path.split('/');
					const dir =
						segments.length > 1
							? segments.slice(0, -1).join('/')
							: '';

					return { name, dir, value: id };
				});

			const fuse = new Fuse(options, {
				keys: [
					{ name: 'name', weight: 0.9 },
					{ name: 'dir', weight: 0.1 },
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
		if (option.value === 'NO_RESULT') {
			return <div>No matching results</div>;
		}

		return (
			<div className={cls.option.block()}>
				<FileTextIcon size={16} className={cls.option.icon()} />
				<div className={cls.option.name()}>{option.name}</div>
				<div className={cls.option.dir()}>{option.dir}</div>
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

	const handleSelect = async (stringId: string) => {
		const id = +stringId;

		if (Number.isNaN(id)) {
			return;
		}

		await api.endSearch(id);

		setSelectedScript(id);
		appStore.setView('scripts'); // FIXME: wrong sidebar item gets highlighted
		dialogRef.current?.close();
	};

	const handleClose = async () => {
		await api.endSearch();

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
