import { createContext, useContext } from 'react';

export type DnDContextData<Drag = unknown, Drop = unknown> = {
	useDraggable: <T extends HTMLElement>(
		getData: () => Drag
	) => {
		draggable: React.RefObject<T | null>;
		isDragged: boolean;
	};
	useDropTarget: <T extends HTMLElement>(
		getData: () => Drop
	) => {
		dropTarget: React.RefObject<T | null>;
		hasDragOver: boolean;
		hasLongHover: boolean;
	};
	isDragging: boolean;
};

export const DnDContext = createContext<DnDContextData>(null as any);

export const useDnD = <Drag, Drop>() => {
	const context = useContext(DnDContext);
	if (!context) {
		throw new Error('useDnD must be used within a DnDProvider');
	}
	return context as DnDContextData<Drag, Drop>;
};
