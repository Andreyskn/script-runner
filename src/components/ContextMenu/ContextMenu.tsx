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

export type ContextMenuItem = {
	icon: React.ReactNode;
	text: string;
	onClick: () => void;
};

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
	register: null as any,
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

				setAnchorPos([ev.clientX, ev.clientY]);
				setMenuItems(data.getContent());
				menu.current?.hidePopover();
				menu.current?.showPopover();
				isOpen.setState(data.elementRef);
			});
		};

		menu.current?.addEventListener('toggle', (ev) => {
			ev.stopImmediatePropagation();

			if (!document.querySelector('#context-menu-popover:popover-open')) {
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

			<div
				id='context-menu-popover'
				ref={menu}
				popover='auto'
				className={cls.menu.block()}
			>
				{menuItems.map((item, i) => (
					<div key={i}>
						{item.icon}
						{item.text}
					</div>
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
