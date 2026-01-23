import { ipcRenderer } from 'electron/renderer';

import type { PackContent } from '../../../src/shared';
import { createWindowAPI, ELECTRON_API_NAME } from '../ipc';

export type MainWindowConfig = typeof config;

const stateProxy = new Proxy(
	{ state: null as Record<PropertyKey, PackContent> | null },
	{
		get() {
			try {
				// @ts-ignore
				return INITIAL_APP_STATE;
			} catch (error) {
				return null;
			}
		},
	}
);

const config = {
	windowId: 'main',
	initialState: stateProxy.state,
} as const;

(window as any)[ELECTRON_API_NAME] = createWindowAPI(ipcRenderer, config);
