import { EventEmitter } from 'eventemitter3';
import type { ElementRef, ElementRefMeta } from 'src/utils/dnd/dndProvider';

type ChangeEvent = 'source' | 'target' | 'long-hover';
type ElementData = any;

export class DnDSession {
	#ee = new EventEmitter<ChangeEvent, undefined>();

	#elementRefs: Map<ElementRef, ElementRefMeta>;
	#elementData: Map<ElementRef, ElementData> = new Map();

	#canDropFn?: (source: ElementData, target: ElementData) => boolean;
	#canDropMap: Map<ElementRef, boolean> = new Map();

	source: ElementRef | null = null;
	target: ElementRef | null = null;
	longHover: LongHover;

	constructor(
		refs: Map<ElementRef, ElementRefMeta>,
		longHoverThreshold?: number,
		canDrop?: (source: ElementData, target: ElementData) => boolean
	) {
		this.#elementRefs = refs;
		this.#canDropFn = canDrop;
		this.longHover = new LongHover(this.#ee, longHoverThreshold);
	}

	getData = (ref: ElementRef) => {
		if (this.#elementData.has(ref)) {
			return this.#elementData.get(ref);
		}

		const data = this.#elementRefs.get(ref)?.getData();
		this.#elementData.set(ref, data);

		return data;
	};

	canDrop = (target: ElementRef): boolean => {
		if (!this.#canDropFn) {
			return true;
		}

		if (this.#canDropMap.has(target)) {
			return this.#canDropMap.get(target)!;
		}

		const sourceData = this.getData(this.source!);
		const targetData = this.getData(target);
		const canDrop = this.#canDropFn(sourceData, targetData);
		this.#canDropMap.set(target, canDrop);

		return canDrop;
	};

	subscribe = (event: ChangeEvent, listener: () => void) => {
		this.#ee.on(event, listener);

		return () => {
			this.#ee.off(event, listener);
		};
	};

	setSource = (source: ElementRef | null) => {
		this.source = source;
		this.#ee.emit('source');
	};

	setTarget = (target: ElementRef | null) => {
		if (target !== this.target) {
			this.target = target;
			this.#ee.emit('target');
		}

		this.longHover.setHover(target);
	};

	clear = () => {
		this.setSource(null);
		this.setTarget(null);
		this.longHover.setHover(null);
		this.#elementData.clear();
		this.#canDropMap.clear();
	};
}

type LongHoverCandidate = {
	ref: ElementRef | null;
	startTime: number | null;
};

class LongHover {
	active: ElementRef | null = null;
	#candidate: LongHoverCandidate = {
		ref: null,
		startTime: null,
	};
	#threshold: number;

	constructor(
		private ee: EventEmitter<ChangeEvent>,
		threshold: number = 700
	) {
		this.#threshold = threshold;
	}

	setHover = (ref: ElementRef | null) => {
		if (!ref) {
			this.#candidate = {
				ref: null,
				startTime: null,
			};
			if (this.active) {
				this.active = null;
				this.ee.emit('long-hover');
			}
			return;
		}

		if (ref === this.active) {
			return;
		}

		if (ref !== this.#candidate.ref) {
			this.#candidate.ref = ref;
			this.#candidate.startTime = performance.now();
			return;
		}

		if (performance.now() - this.#candidate.startTime! >= this.#threshold) {
			this.active = this.#candidate.ref;
			this.ee.emit('long-hover');
		}
	};
}
