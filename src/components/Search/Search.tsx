import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Fzf } from 'fzf';
import { FileTextIcon } from 'lucide-react';

import { api, ipc } from '@/api';
import { appStore } from '@/App/appStore';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { parsePath } from '@/utils';
import { filesStore, type File } from '@/views/Scripts/stores/filesStore';

import { sortNodes } from '../Tree/treeUtils';
import { cls } from './Search.styles';
import { search, type SearchAPI } from './searchApi';

const NO_RESULTS: ComboboxOption[] = [
	{
		value: 'NO_RESULT',
	},
];

type HighlightCharsProps = {
	text: string;
	positions?: Set<number>;
	offset?: number;
};

const HighlightChars: React.FC<HighlightCharsProps> = (props) => {
	const { text, positions, offset = 0 } = props;

	if (!positions?.size) {
		return text;
	}

	const chars = text.normalize().split('');

	return chars.map((char, i) => {
		if (positions.has(i + offset)) {
			return <b key={i}>{char}</b>;
		} else {
			return char;
		}
	});
};

export type SearchProps = {};

export const Search: React.FC<SearchProps> = () => {
	const [shouldRenderContent, setShouldRenderContent] = useState(false);

	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		Object.assign(search, {
			show: () => {
				dialogRef.current?.showModal();
				setShouldRenderContent(true);
			},
			hide: () => {
				dialogRef.current?.close();
			},
		} satisfies SearchAPI);
	}, []);

	useHotkeys('ctrl+p', search.show, {
		preventDefault: true,
		enableOnFormTags: true,
	});

	useHotkeys('esc', search.hide, {
		enableOnFormTags: true,
	});

	return (
		<dialog
			// @ts-expect-error
			closedby='any'
			ref={dialogRef}
			className={cls.dialog.block({
				standalone: ipc.config?.windowId === 'search',
			})}
			onClose={() => setShouldRenderContent(false)}
			onCancel={() => setShouldRenderContent(false)}
		>
			{shouldRenderContent && <DialogContent />}
		</dialog>
	);
};

const DialogContent: React.FC = () => {
	const { useSelector, setSelectedScript } = filesStore;

	const { getFile, find, initialOptions } = useSelector(
		(state) => state.files,
		(files) => {
			const searchList: Pick<File, 'id' | 'path'>[] = [];

			const items = Object.fromEntries(
				sortNodes([...files.values()], 'name')
					.filter(({ type }) => type === 'script')
					.map(({ path, id, name }) => {
						const { dir } = parsePath(path);

						searchList.push({ id, path });

						return [id, { path, name, dir }];
					})
			);

			const fzf = new Fzf(searchList, {
				selector: (o) => o.path,
				forward: false,
			});

			let positions: Record<File['id'], Set<number>> | undefined;

			const find = (term: string): ComboboxOption[] => {
				const results = fzf.find(term);

				positions = Object.fromEntries(
					results.map((r) => [r.item.id, r.positions])
				);

				return results.map((r) => ({ value: r.item.id }));
			};

			const getFile = (id: File['id']) => ({
				...items[id]!,
				positions: positions?.[id],
			});

			return { getFile, find, initialOptions: find('') };
		}
	);

	const [results, setResults] = useState<ComboboxOption[]>(initialOptions);

	useEffect(() => setResults(initialOptions), [initialOptions]);

	const selectRef = useRef<HTMLSelectElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const renderOption = (option: ComboboxOption) => {
		if (option.value === 'NO_RESULT') {
			return <div>No matching results</div>;
		}

		const { dir, name, positions } = getFile(+option.value!);

		return (
			<div className={cls.option.block()}>
				<FileTextIcon size={16} className={cls.option.icon()} />
				<div className={cls.option.name()}>
					<HighlightChars
						text={name}
						positions={positions}
						offset={dir.length ? dir.length + 1 : 0}
					/>
				</div>
				<div className={cls.option.dir()}>
					<HighlightChars text={dir} positions={positions} />
				</div>
			</div>
		);
	};

	const handleInputChange = (value: string) => {
		setResults(find(value));
	};

	const handleSelect = async (stringId: string) => {
		const id = +stringId;

		if (Number.isNaN(id)) {
			return;
		}

		if (ipc.config?.windowId === 'search') {
			await api.endSearch(id);
		}

		setSelectedScript(id);
		appStore.setView('scripts');
		search.hide();
	};

	useEffect(() => {
		inputRef.current?.focus();

		return () => {
			if (ipc.config?.windowId === 'search') {
				api.endSearch();
			}
		};
	}, []);

	return (
		<Combobox
			selectRef={selectRef}
			inputRef={inputRef}
			selectClassName={cls.search.select()}
			placeholder='Search scripts... (Tab ↑↓ to navigate)'
			options={results.length ? results : NO_RESULTS}
			renderOption={renderOption}
			onInputChange={handleInputChange}
			onSelect={handleSelect}
			inputId='search-input'
			selectId='search-select'
		/>
	);
};
