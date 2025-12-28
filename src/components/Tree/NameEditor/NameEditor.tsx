import { useEffect, useRef, useState } from 'react';

import type { TreeNodeWithPath } from '@/components/Tree/treeTypes';

import { cls } from './NameEditor.styles';
import { nameEditorSession } from './nameEditorSession';

type RenameInitialData = {
	text?: string;
	selection?: [number, number];
};

export type TreeNodeRenameHandler = {
	before?: (node: TreeNodeWithPath) => {
		text?: string;
		selection?: [number, number];
	} | void;
	change?: (
		node: TreeNodeWithPath,
		newName: string
	) => {
		hint?: React.ReactNode;
		error?: React.ReactNode;
	} | void;
	cancel?: (node: TreeNodeWithPath) => void;
	confirm?: (node: TreeNodeWithPath, newName: string) => void;
};

export type NameEditorProps = {
	onRename?: TreeNodeRenameHandler;
};

export const NameEditor: React.FC<NameEditorProps> = (props) => {
	const { onRename } = props;

	const popover = useRef<HTMLFormElement>(null);
	const input = useRef<HTMLInputElement>(null);

	const [hint, setHint] = useState<React.ReactNode>(null);
	const [error, setError] = useState<React.ReactNode>(null);

	const initialData = useRef<Required<RenameInitialData>>({
		text: '',
		selection: [0, 0],
	});

	useEffect(() => {
		popover.current?.addEventListener('beforetoggle', (ev) => {
			ev.stopImmediatePropagation();

			const { state } = nameEditorSession;

			if (ev.newState === 'closed') {
				if (state.status !== 'confirmed') {
					onRename?.cancel?.(state.activeNode!);
					nameEditorSession.setStatus('cancelled');
				}
				return;
			}

			if (ev.newState === 'open' && state.activeNode && input.current) {
				initialData.current = {
					text: state.activeNode.name,
					selection: [0, state.activeNode.name.length],
					...onRename?.before?.(state.activeNode),
				};

				input.current.value = initialData.current.text;
			}
		});

		popover.current?.addEventListener('toggle', (ev) => {
			ev.stopImmediatePropagation();

			const { state } = nameEditorSession;
			// closed

			if (state.status === 'confirmed' || state.status === 'cancelled') {
				nameEditorSession.toggle(null);
				setError(null);
				setHint(null);
				return;
			}

			// open
			if (!input.current) {
				return;
			}

			input.current.focus();
			input.current.setSelectionRange(...initialData.current.selection);
		});
	}, []);

	const activeNode = nameEditorSession.useSelector(
		(state) => state.activeNode
	);
	const shouldShowEditor = !!activeNode;

	useEffect(() => {
		if (shouldShowEditor) {
			popover.current?.showPopover();
		}
	}, [shouldShowEditor]);

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		const { state } = nameEditorSession;

		if (error || !state.activeNode || !input.current?.value) {
			return;
		}

		onRename?.confirm?.(state.activeNode, input.current.value);
		nameEditorSession.setStatus('confirmed');
		popover.current?.hidePopover();
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const { state } = nameEditorSession;
		const result = onRename?.change?.(state.activeNode!, ev.target.value);
		setHint(result?.hint);
		setError(result?.error);
	};

	return (
		<form
			ref={popover}
			popover='auto'
			onSubmit={handleSubmit}
			className={cls.editor.block()}
		>
			<input
				ref={input}
				name='filename'
				autoComplete='off'
				type='text'
				className={cls.editor.input({
					folder: activeNode?.type === 'folder',
					error,
				})}
				onChange={handleChange}
			/>
			{error && <div className={cls.editor.error()}>{error}</div>}
			{hint}
		</form>
	);
};
