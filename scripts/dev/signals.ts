import { effect, signal, type Signal } from '@preact/signals';

export const signals = {
	electronStarting: signal(false),
	electronRunning: signal(false),
	shouldServerRun: signal(true),
};

export const when = <T extends Signal>(
	signal: T,
	targetValue: T['value'],
	callback: () => void
) => {
	effect(function () {
		if (signal.value === targetValue) {
			callback();
			this.dispose();
		}
	});
};
