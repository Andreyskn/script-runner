import { Button, type ButtonProps } from '@/components/Button';
import React, {
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
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

	const isContextMenuOpen = useSyncExternalStore(
		isOpen.subscribe,
		() =>
			!!contextMenuTrigger.current &&
			isOpen.current?.current === contextMenuTrigger.current
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
					isOpen.setState(data.elementRef);
				}
			});
		};

		menu.current?.addEventListener('beforetoggle', (ev) => {
			// @ts-expect-error
			if (ev.newState === 'closed') {
				isOpen.setState(null);
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

export const isOpen = {
	current: null as ElementRef | null,
	listeners: new Set<() => void>(),

	subscribe(listener: () => void) {
		isOpen.listeners.add(listener);
		return () => isOpen.listeners.delete(listener);
	},

	setState(value: ElementRef | null) {
		isOpen.current = value;
		isOpen.listeners.forEach((listener) => listener());
	},
};
