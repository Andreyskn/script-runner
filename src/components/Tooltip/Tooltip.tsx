import { useEffect, useRef, useState } from 'react';

import { cls } from './Tooltip.styles';

declare module 'react' {
	interface CSSProperties {
		'--tooltip-anchor'?: string;
	}
}

export type TooltipProps = {
	children: React.ReactNode;
	content: React.ReactNode;
	className?: string;
};

export const Tooltip: React.FC<TooltipProps> = (props) => {
	const { children, content, className } = props;

	const anchorName = useRef('');
	if (!anchorName.current) {
		anchorName.current = tooltip.getAnchorName();
	}

	useEffect(() => tooltip.close, []);

	const handleMouseEnter: React.MouseEventHandler = () => {
		tooltip.open(anchorName.current, content);
	};

	const handleMouseLeave: React.MouseEventHandler = () => {
		tooltip.close();
	};

	return (
		<div
			popoverTarget='tooltip'
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={cls.wrapper.block(null, className)}
			style={{ '--tooltip-anchor': anchorName.current }}
		>
			{children}
		</div>
	);
};

type TooltipAPI = {
	counter: number;
	getAnchorName: () => string;
	reset: () => void;
	set: (handlers: Pick<TooltipAPI, 'open' | 'close'>) => void;
	open: (anchor: string, content: React.ReactNode) => void;
	close: () => void;
};

type AnyFunction = (...args: any[]) => any;
const noop: AnyFunction = () => {};

const tooltip = {
	counter: 0,
	getAnchorName() {
		return `--tooltip-anchor-${this.counter++}`;
	},
	set(handlers) {
		Object.assign(this, handlers);
	},
	reset() {
		this.set({
			close: noop,
			open: noop,
		});
	},
} as TooltipAPI;
tooltip.reset();

type TooltipPopoverData = {
	anchor: string;
	content: React.ReactNode;
};

export const TooltipPopover: React.FC = () => {
	const [data, setData] = useState<TooltipPopoverData>({
		anchor: '',
		content: null,
	});
	const { anchor, content } = data;
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		tooltip.set({
			open: (anchor, content) => {
				setData({ anchor, content });
			},
			close: () => {
				tooltipRef.current?.hidePopover();
			},
		});

		return () => {
			tooltip.reset();
		};
	}, []);

	useEffect(() => {
		if (data.anchor) {
			tooltipRef.current?.showPopover();
		}
	}, [data]);

	return (
		<div
			id='tooltip'
			popover='manual'
			ref={tooltipRef}
			className={cls.tooltip.block()}
			style={{ '--tooltip-anchor': anchor }}
		>
			<div className={cls.tooltip.arrow()} />
			{content}
		</div>
	);
};
