import { type RefObject, useEffect, useRef } from 'react';

import { ComponentStore } from '@/utils';

import type { ContextMenuItem } from './ContextMenu';

type RegisterData = {
	elementRef: RefObject<HTMLElement | null>;
	getContent: () => ContextMenuItem[];
};

export type ContextMenuAPI = {
	register: (data: RegisterData) => void;
};

export const contextMenu: ContextMenuAPI = {
	register: () => {},
};

type ContextMenuState = {
	activeElement: HTMLElement | null;
};

class ContextMenuStore extends ComponentStore<ContextMenuState> {
	state: ContextMenuState = {
		activeElement: null,
	};

	setActive = (ref: HTMLElement | null) => {
		this.setState((state) => {
			state.activeElement = ref;
		});
	};
}

export const contextMenuStore = new ContextMenuStore();

export const useContextMenu = <T extends HTMLElement>(
	getContent: () => ContextMenuItem[]
) => {
	const contextMenuTrigger = useRef<T>(null);

	useEffect(() => {
		contextMenu.register({
			elementRef: contextMenuTrigger,
			getContent,
		});
	}, []);

	const isContextMenuOpen = contextMenuStore.useSelector(
		(state) => state.activeElement,
		(el) => {
			return (
				!!contextMenuTrigger.current &&
				el === contextMenuTrigger.current
			);
		}
	);

	return { contextMenuTrigger, isContextMenuOpen };
};
