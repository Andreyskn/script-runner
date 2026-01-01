import { ipcRenderer } from 'electron/renderer';

import { createWindowAPI, ELECTRON_API_NAME } from '../ipc';

export type MainWindowConfig = typeof config;

const config = {};

(window as any)[ELECTRON_API_NAME] = createWindowAPI(ipcRenderer, config);
