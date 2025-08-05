import React, {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';

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

			// @ts-expect-error
			if (ev.newState === 'closed') {
				if (session.status !== SessionStatus.Confirmed) {
					onRename?.cancel?.(session.activeNode!);
					session.setStatus(SessionStatus.Cancelled);
				}
				return;
			}

			// @ts-expect-error
			if (ev.newState === 'open' && session.activeNode && input.current) {
				initialData.current = {
					text: session.activeNode.name,
					selection: [0, session.activeNode.name.length],
					...onRename?.before?.(session.activeNode),
				};

				input.current.value = initialData.current.text;
			}
		});

		popover.current?.addEventListener('toggle', (ev) => {
			ev.stopImmediatePropagation();

			// closed
			if (
				session.status === SessionStatus.Confirmed ||
				session.status === SessionStatus.Cancelled
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

	const activeNode = useSyncExternalStore(
		session.subscribe('toggle'),
		() => session.activeNode
	);
	const shouldShowEditor = !!activeNode;

	useEffect(() => {
		if (shouldShowEditor) {
			popover.current?.showPopover();
		}
	}, [shouldShowEditor]);

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
		ev.preventDefault();

		if (!session.activeNode || !input.current) {
			return;
		}

		onRename?.confirm?.(session.activeNode, input.current.value);
		session.setStatus(SessionStatus.Confirmed);
		popover.current?.hidePopover();
	};

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
		const result = onRename?.change?.(session.activeNode!, ev.target.value);
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

type RenamingEvent = 'toggle';

const enum SessionStatus {
	Inactive,
	Active,
	Confirmed,
	Cancelled,
}

class RenamingSession extends ComponentStore<RenamingEvent> {
	activeNode: TreeNodeWithPath | null = null;
	status: SessionStatus = SessionStatus.Inactive;

	toggle = (node: TreeNodeWithPath | null) => {
		if (!node) {
			this.setStatus(SessionStatus.Inactive);
		} else {
			this.setStatus(SessionStatus.Active);
		}

		this.activeNode = node;
		this.emit('toggle');
	};

	setStatus = (status: SessionStatus) => {
		this.status = status;
	};
}

const session = new RenamingSession();

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

	useLayoutEffect(() => {
		if (renameOnMount) {
			showNameEditor();
		}
	}, []);

	const isRenaming = useSyncExternalStore(
		session.subscribe('toggle'),
		() => session.activeNode?.id === node.id
	);

	return { showNameEditor, isRenaming, NameEditorAnchor };
};
