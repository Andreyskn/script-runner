import React, { useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '@/components/Button';
import { ComponentStore } from '@/utils';

import { cls } from './ContextMenu.styles';

declare module 'react' {
	interface CSSProperties {
		'--context-anchor-x'?: `${number}px`;
		'--context-anchor-y'?: `${number}px`;
	}
}

type ElementRef = React.RefObject<HTMLElement | null>;

export type ContextMenuProps = {
	elementRef: ElementRef;
	menu: React.ReactNode;
};

export type ContextMenuItem = Pick<
	ButtonProps,
	'icon' | 'text' | 'onClick' | 'color'
>;

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

	const isContextMenuOpen = store.useSelector(
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

type RegisterData = {
	elementRef: ElementRef;
	getContent: () => ContextMenuItem[];
};

type ContextMenuAPI = {
	register: (data: RegisterData) => void;
};

export const contextMenu: ContextMenuAPI = {
	register: () => {},
};

type PositionX = number;
type PositionY = number;
type Position = [PositionX, PositionY];

export const ContextMenu: React.FC = () => {
	const menu = useRef<HTMLDivElement>(null);

	const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);
	const [anchorPos, setAnchorPos] = useState<Position>([0, 0]);

	useEffect(() => {
		contextMenu.register = (data) => {
			data.elementRef.current?.addEventListener('contextmenu', (ev) => {
				ev.preventDefault();
				ev.stopImmediatePropagation();

				menu.current?.hidePopover();
			});

			data.elementRef.current?.addEventListener('mouseup', (ev) => {
				if (ev.button === 2) {
					ev.stopImmediatePropagation();

					setAnchorPos([ev.clientX, ev.clientY]);
					setMenuItems(data.getContent());

					menu.current?.showPopover();
					store.setActive(data.elementRef.current);
				}
			});
		};

		menu.current?.addEventListener('beforetoggle', (ev) => {
			ev.stopImmediatePropagation();

			if (ev.newState === 'closed') {
				store.setActive(null);
			}
		});
	}, []);

	return (
		<>
			<div
				className={cls.anchor.block()}
				style={{
					'--context-anchor-x': `${anchorPos[0]}px`,
					'--context-anchor-y': `${anchorPos[1]}px`,
				}}
			/>

			<div ref={menu} popover='auto' className={cls.menu.block()}>
				{menuItems.map((item, i) => (
					<Button
						key={i}
						{...item}
						borderless
						size='small'
						align='left'
						stretch
						onClick={(ev) => {
							menu.current?.hidePopover();
							item.onClick?.(ev);
						}}
					/>
				))}
			</div>
		</>
	);
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

const store = new ContextMenuStore();
