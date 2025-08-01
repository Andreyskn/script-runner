import type { ElementRef } from 'src/utils/dnd/DnDProvider';

// TODO: single store object

export const dragOver = {
	current: null as HTMLElement | null,
	listeners: new Set<() => void>(),

	subscribe(listener: () => void) {
		dragOver.listeners.add(listener);
		return () => dragOver.listeners.delete(listener);
	},

	setState(value: HTMLElement | null) {
		dragOver.current = value;
		dragOver.listeners.forEach((listener) => listener());
	},
};

export const dragged = {
	current: null as ElementRef | null,
	last: null as ElementRef | null,
	listeners: new Set<() => void>(),

	subscribe(listener: () => void) {
		dragged.listeners.add(listener);
		return () => dragged.listeners.delete(listener);
	},

	setState(value: ElementRef | null) {
		dragged.current = value;
		if (value) {
			dragged.last = value;
		}
		dragged.listeners.forEach((listener) => listener());
	},
};

type LongHoverCandidate = {
	element: HTMLElement | null;
	startTime: number | null;
};

export class LongHover {
	current: HTMLElement | null = null;
	candidate: LongHoverCandidate = {
		element: null,
		startTime: null,
	};
	threshold: number;
	listeners = new Set<() => void>();

	constructor(threshold: number = 700) {
		this.threshold = threshold;
	}

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	setHover = (value: HTMLElement | null) => {
		if (!value) {
			this.current = null;
			this.candidate = {
				element: null,
				startTime: null,
			};
			this.listeners.forEach((listener) => listener());
			return;
		}

		if (value === this.current) {
			return;
		}

		if (value !== this.candidate.element) {
			this.candidate.element = value;
			this.candidate.startTime = performance.now();
			return;
		}

		if (performance.now() - this.candidate.startTime! >= this.threshold) {
			this.current = this.candidate.element;
			this.listeners.forEach((listener) => listener());
		}
	};
}
