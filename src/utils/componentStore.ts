import EventEmitter from 'eventemitter3';

export class ComponentStore<T extends string> {
	private ee = new EventEmitter<T>();

	protected emit = (event: T) => {
		// @ts-ignore
		this.ee.emit(event);
	};

	public subscribe = (event: T) => (listener: () => void) => {
		// @ts-ignore
		this.ee.on(event, listener);

		return () => {
			// @ts-ignore
			this.ee.off(event, listener);
		};
	};
}
