import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { DnDContext, type DnDContextData } from 'src/utils/dnd/dndContext';
import { DnDSession } from 'src/utils/dnd/dndSession';

export type ElementRef = React.RefObject<HTMLElement | null>;

const enum ElementType {
	DropTarget,
	Draggable,
}

export type ElementRefMeta = {
	type: ElementType;
	getData: () => any;
};

export type DnDProviderProps<Source, Target> = {
	children: React.ReactNode;
	onDrop: (source: Source, target: Target) => void;
	longHoverThreshold?: number;
	canDrop?: (source: Source, target: Target) => boolean;
};

export const DnDProvider = <Source, Target>(
	props: DnDProviderProps<Source, Target>
): React.ReactNode => {
	const { children, onDrop, longHoverThreshold, canDrop } = props;

	const [elements] = useState(() => new Map<ElementRef, ElementRefMeta>());
	const [uninitialized] = useState(() => new Set<ElementRef>());
	const [session] = useState(
		() => new DnDSession(elements, longHoverThreshold, canDrop)
	);

	const useDraggable: DnDContextData['useDraggable'] = useCallback(
		<T extends HTMLElement>(getData: () => unknown) => {
			const draggable = useRef<T>(null);

			useEffect(() => {
				elements.set(draggable, {
					type: ElementType.Draggable,
					getData,
				});
				uninitialized.add(draggable);

				return () => {
					elements.delete(draggable);
					uninitialized.delete(draggable);
				};
			}, []);

			const isDragged = useSyncExternalStore(
				session.subscribe.bind(session, 'source'),
				() =>
					!!draggable.current &&
					session.source?.current === draggable.current
			);

			return { draggable, isDragged };
		},
		[]
	);

	const useDropTarget: DnDContextData['useDropTarget'] = useCallback(
		<T extends HTMLElement>(getData: () => unknown) => {
			const dropTarget = useRef<T>(null);

			useEffect(() => {
				elements.set(dropTarget, {
					type: ElementType.DropTarget,
					getData,
				});
				uninitialized.add(dropTarget);

				return () => {
					elements.delete(dropTarget);
					uninitialized.delete(dropTarget);
				};
			}, []);

			const hasDragOver = useSyncExternalStore(
				session.subscribe.bind(session, 'target'),
				() =>
					!!dropTarget.current &&
					session.target?.current === dropTarget.current
			);

			const hasLongHover = useSyncExternalStore(
				session.subscribe.bind(session, 'long-hover'),
				() =>
					!!dropTarget.current &&
					session.longHover.active?.current === dropTarget.current
			);

			return { dropTarget, hasDragOver, hasLongHover };
		},
		[]
	);

	const initDraggable = useCallback((ref: ElementRef) => {
		const element = ref.current!;

		element.setAttribute('draggable', 'true');

		element.addEventListener('dragstart', () => {
			session.setSource(ref);
		});

		element.addEventListener('dragend', () => {
			session.clear();
		});
	}, []);

	const initDropTarget = useCallback((ref: ElementRef) => {
		const element = ref.current!;

		element.addEventListener('dragover', (ev) => {
			ev.preventDefault();
			ev.stopImmediatePropagation();

			if (!session.canDrop(ref)) {
				session.setTarget(null);
				ev.dataTransfer!.dropEffect = 'none';
				return;
			}

			ev.dataTransfer!.dropEffect = 'move';
			session.setTarget(ref);
		});

		element.addEventListener('drop', (ev) => {
			ev.preventDefault();
			ev.stopImmediatePropagation();

			const source = session.source!;
			const sourceData = session.getData(source);
			const targetData = session.getData(ref);

			onDrop(sourceData, targetData);
		});
	}, []);

	useEffect(() => {
		uninitialized.forEach((element) => {
			const { type } = elements.get(element)!;

			if (type === ElementType.Draggable) {
				initDraggable(element);
			} else {
				initDropTarget(element);
			}

			uninitialized.delete(element);
		});
	});

	return (
		<DnDContext
			value={{
				useDraggable,
				useDropTarget,
			}}
		>
			{children}
		</DnDContext>
	);
};
