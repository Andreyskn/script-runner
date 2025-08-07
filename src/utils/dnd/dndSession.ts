import { ComponentStore, getStoreInitHook } from '@/utils';
import type { ElementRef, ElementRefMeta } from '@/utils/dnd/dndProvider';

type ElementData = any;

type SessionState = {
	source: ElementRef | null;
	target: ElementRef | null;
};

class DnDSession extends ComponentStore<SessionState> {
	state: SessionState = {
		source: null,
		target: null,
	};

	longHover: LongHover;

	#elementRefs: Map<ElementRef, ElementRefMeta>;
	#elementData: Map<ElementRef, ElementData> = new Map();

	#canDropFn?: (source: ElementData, target: ElementData) => boolean;
	#canDropMap: Map<ElementRef, boolean> = new Map();

	constructor(
		refs: Map<ElementRef, ElementRefMeta>,
		longHoverThreshold?: number,
		canDrop?: (source: ElementData, target: ElementData) => boolean
	) {
		super();
		this.#elementRefs = refs;
		this.#canDropFn = canDrop;
		this.longHover = new LongHover(longHoverThreshold);
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

		const sourceData = this.getData(this.state.source!);
		const targetData = this.getData(target);
		const canDrop = this.#canDropFn(sourceData, targetData);
		this.#canDropMap.set(target, canDrop);

		return canDrop;
	};

	setSource = (source: ElementRef | null) => {
		this.setState((state) => {
			state.source = source;
		});
	};

	setTarget = (target: ElementRef | null) => {
		if (target !== this.state.target) {
			this.setState((state) => {
				state.target = target;
			});
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

const { useInitStore: useInitDnDSession } = getStoreInitHook(DnDSession);

export { useInitDnDSession };

type LongHoverCandidate = {
	ref: ElementRef | null;
	startTime: number | null;
};

type LongHoverState = {
	active: ElementRef | null;
};

class LongHover extends ComponentStore<LongHoverState> {
	state: LongHoverState = {
		active: null,
	};

	#candidate: LongHoverCandidate = {
		ref: null,
		startTime: null,
	};
	#threshold: number;

	constructor(threshold: number = 700) {
		super();
		this.#threshold = threshold;
	}

	setHover = (ref: ElementRef | null) => {
		if (!ref) {
			this.#candidate = {
				ref: null,
				startTime: null,
			};
			if (this.state.active) {
				this.setState((state) => {
					state.active = null;
				});
			}
			return;
		}

		if (ref === this.state.active) {
			return;
		}

		if (ref !== this.#candidate.ref) {
			this.#candidate.ref = ref;
			this.#candidate.startTime = performance.now();
			return;
		}

		if (performance.now() - this.#candidate.startTime! >= this.#threshold) {
			this.setState((state) => {
				state.active = this.#candidate.ref;
			});
		}
	};
}
