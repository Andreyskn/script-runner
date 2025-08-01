import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { DnDContext, type DnDContextData } from 'src/utils/dnd/context';
import { dragged, dragOver, LongHover } from 'src/utils/dnd/store';

export type ElementRef = React.RefObject<HTMLElement | null>;

const enum ElementType {
	DropTarget,
	Draggable,
}

type ElementRefMeta = {
	type: ElementType;
	getData: () => any;
	isInitialized?: boolean;
};

export type DnDProviderProps<Drag, Drop> = {
	children: React.ReactNode;
	onDrop: (source: Drag, target: Drop) => void;
	longHoverThreshold?: number;
};

export const DnDProvider = <Drag, Drop>(
	props: DnDProviderProps<Drag, Drop>
): React.ReactNode => {
	const { children, onDrop, longHoverThreshold } = props;

	const elements = useRef(new Map<ElementRef, ElementRefMeta>());

	const [longHover] = useState(() => new LongHover(longHoverThreshold));
	const [isDragging, setIsDragging] = useState(false);

	const useDraggable: DnDContextData['useDraggable'] = useCallback(
		<T extends HTMLElement>(getData: () => unknown) => {
			const draggable = useRef<T>(null);

			useEffect(() => {
				elements.current.set(draggable, {
					type: ElementType.Draggable,
					getData,
				});

				return () => {
					elements.current.delete(draggable);
				};
			}, []);

			const isDragged = useSyncExternalStore(
				dragged.subscribe,
				() =>
					!!draggable.current &&
					dragged.current?.current === draggable.current
			);

			return { draggable, isDragged };
		},
		[]
	);

	const useDropTarget: DnDContextData['useDropTarget'] = useCallback(
		<T extends HTMLElement>(getData: () => unknown) => {
			const dropTarget = useRef<T>(null);

			useEffect(() => {
				elements.current.set(dropTarget, {
					type: ElementType.DropTarget,
					getData,
				});

				return () => {
					elements.current.delete(dropTarget);
				};
			}, []);

			const hasDragOver = useSyncExternalStore(
				dragOver.subscribe,
				() =>
					!!dropTarget.current &&
					dragOver.current === dropTarget.current
			);

			const hasLongHover = useSyncExternalStore(
				longHover.subscribe,
				() =>
					!!dropTarget.current &&
					longHover.current === dropTarget.current
			);

			return { dropTarget, hasDragOver, hasLongHover };
		},
		[]
	);

	const initDraggable = useCallback((ref: ElementRef) => {
		const element = ref.current!;

		element.setAttribute('draggable', 'true');

		element.addEventListener('dragstart', () => {
			dragged.setState(ref);
			setIsDragging(true);
		});

		element.addEventListener('dragend', () => {
			dragged.setState(null);
			dragOver.setState(null);
			longHover.setHover(null);
			setIsDragging(false);
		});
	}, []);

	const initDropTarget = useCallback((ref: ElementRef) => {
		const element = ref.current!;

		element.addEventListener('dragover', (ev) => {
			ev.preventDefault();
			ev.stopImmediatePropagation();

			dragOver.setState(element);
			longHover.setHover(element);
		});

		element.addEventListener('drop', (ev) => {
			ev.preventDefault();
			ev.stopImmediatePropagation();

			const draggedRef = dragged.last;
			const dragData = elements.current.get(draggedRef!)?.getData();
			const dropData = elements.current.get(ref)?.getData();

			onDrop(dragData, dropData);
		});
	}, []);

	useEffect(() => {
		elements.current.forEach((meta, element) => {
			if (!element.current) {
				elements.current.delete(element);
				return;
			}

			if (meta.isInitialized) {
				return;
			}

			if (meta.type === ElementType.Draggable) {
				initDraggable(element);
			} else {
				initDropTarget(element);
			}

			meta.isInitialized = true;
		});
	});

	return (
		<DnDContext
			value={{
				useDraggable,
				useDropTarget,
				isDragging,
			}}
		>
			{children}
		</DnDContext>
	);
};
