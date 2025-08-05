import { useState, useSyncExternalStore } from 'react';

import { ComponentStore } from '@/utils';

type ScriptViewerEvents = 'toggle-edit' | 'output-change';

class ScriptViewerStore extends ComponentStore<ScriptViewerEvents> {
	static store: { current: ScriptViewerStore } = {
		get current() {
			throw new Error('ScriptViewerStore is not initialized');
			return null as any;
		},
	};

	static init = () => {
		this.store = { current: new ScriptViewerStore() };
		return this.store.current;
	};

	isEditing = false;
	scriptContent = '';
	output = '';

	setEditing = (isEditing: boolean) => {
		this.isEditing = isEditing;
		this.emit('toggle-edit');
	};

	setScriptContent = (content: string) => {
		this.scriptContent = content;
	};

	setOutput = (text: string) => {
		this.output = text;
		this.emit('output-change');
	};

	appendOutput = (text: string) => {
		this.output += text;
		this.emit('output-change');
	};
}

export const initScriptViewerStore = ScriptViewerStore.init;

export const useInitScriptViewerStore = () => {
	useState(initScriptViewerStore);
};

export const useScriptViewerStore = () => {
	const store = ScriptViewerStore.store.current;

	return {
		setEditing: store.setEditing,

		setScriptContent: store.setScriptContent,

		saveScript: () => {
			store.setEditing(false);
			console.log(store.scriptContent);
		},

		get isEditing() {
			return useSyncExternalStore(
				store.subscribe('toggle-edit'),
				() => store.isEditing
			);
		},

		get output() {
			return useSyncExternalStore(
				store.subscribe('output-change'),
				() => store.output
			);
		},
	} satisfies Partial<typeof store> & Record<string, any>;
};
