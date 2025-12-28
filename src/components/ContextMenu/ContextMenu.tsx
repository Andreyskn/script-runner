import React, { useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from '@/components/Button';

import { cls } from './ContextMenu.styles';
import { contextMenu, contextMenuStore } from './contextMenuApi';

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
					contextMenuStore.setActive(data.elementRef.current);
				}
			});
		};

		menu.current?.addEventListener('beforetoggle', (ev) => {
			ev.stopImmediatePropagation();

			if (ev.newState === 'closed') {
				contextMenuStore.setActive(null);
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
