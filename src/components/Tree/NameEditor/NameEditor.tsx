import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { TreeNodeWithPath } from '@/components/Tree/treeTypes';
import { ComponentStore } from '@/utils';

import { cls } from './NameEditor.styles';

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

			const { state } = session;

			if (ev.newState === 'closed') {
				if (state.status !== SessionStatus.Confirmed) {
					onRename?.cancel?.(state.activeNode!);
					session.setStatus(SessionStatus.Cancelled);
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

			const { state } = session;
			// closed

			if (
				state.status === SessionStatus.Confirmed ||
				state.status === SessionStatus.Cancelled
			) {
				session.toggle(null);
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

	const activeNode = session.useSelector((state) => state.activeNode);
	const shouldShowEditor = !!activeNode;

	useEffect(() => {
		if (shouldShowEditor) {
			popover.current?.showPopover();
		}
	}, [shouldShowEditor]);

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		const { state } = session;

		if (error || !state.activeNode || !input.current?.value) {
			return;
		}

		onRename?.confirm?.(state.activeNode, input.current.value);
		session.setStatus(SessionStatus.Confirmed);
		popover.current?.hidePopover();
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const { state } = session;
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

const enum SessionStatus {
	Inactive,
	Active,
	Confirmed,
	Cancelled,
}

type State = {
	activeNode: TreeNodeWithPath | null;
	status: SessionStatus;
};

class RenamingSession extends ComponentStore<State> {
	state: State = {
		activeNode: null,
		status: SessionStatus.Inactive,
	};

	toggle = (node: TreeNodeWithPath | null) => {
		this.setState((state) => {
			if (node) {
				state.status = SessionStatus.Active;
			} else {
				state.status = SessionStatus.Inactive;
			}

			state.activeNode = node;
		});
	};

	setStatus = (status: SessionStatus) => {
		this.setState((state) => {
			state.status = status;
		});
	};
}

const session = RenamingSession.init();

const NameEditorAnchor: React.FC = () => {
	return <div className={cls.anchor.block()} />;
};

export const useNameEditor = (
	node: TreeNodeWithPath,
	renameOnMount?: boolean
) => {
	const showNameEditor = () => {
		session.toggle(node);
	};
	const showNameEditorRef = useRef(showNameEditor);
	showNameEditorRef.current = showNameEditor;

	useLayoutEffect(() => {
		if (renameOnMount) {
			showNameEditor();
		}
	}, []);

	const isRenaming = session.useSelector(
		(state) => state.activeNode,
		(activeNode) => activeNode?.id === node.id
	);

	return { showNameEditor: showNameEditorRef, isRenaming, NameEditorAnchor };
};
