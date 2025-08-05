import { useState, useSyncExternalStore } from 'react';

import { ComponentStore, sleep } from '@/utils';

export type ExecutionResult = 'interrupted' | 'failed' | 'succeeded';

export type ExecutionStatus = 'idle' | 'starting' | 'running' | ExecutionResult;

// TODO: cache by script id

type ScriptViewerEvents = 'edit-toggle' | 'output-change' | 'execution-status';

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
	output: string[] = [];
	executionStatus: ExecutionStatus = 'idle';

	setEditing = (isEditing: boolean) => {
		this.isEditing = isEditing;
		this.emit('edit-toggle');
	};

	setScriptContent = (content: string) => {
		this.scriptContent = content;
	};

	clearOutput = () => {
		this.output = [];
		this.emit('output-change');
	};

	appendOutputLine = (text: string) => {
		this.output = [...this.output, text];
		this.emit('output-change');
	};

	setExecutionStatus = (status: ExecutionStatus) => {
		if (status === 'starting') {
			this.clearOutput();
		}

		this.executionStatus = status;
		this.emit('execution-status');
	};
}

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
				store.subscribe('edit-toggle'),
				() => store.isEditing
			);
		},

		get output() {
			return useSyncExternalStore(
				store.subscribe('output-change'),
				() => store.output
			);
		},

		get executionStatus() {
			return useSyncExternalStore(
				store.subscribe('execution-status'),
				() => store.executionStatus
			);
		},

		runScript: async () => {
			store.setExecutionStatus('starting');
			await sleep(1000);
			store.setExecutionStatus('running');
			store.appendOutputLine('Starting backup...');
			await sleep(1000);
			store.appendOutputLine('Files backed up successfully!');
			await sleep(1000);
			store.appendOutputLine('Backup completed!');

			store.setExecutionStatus('succeeded');
		},
	} satisfies Partial<typeof store> & Record<string, any>;
};

export const initScriptViewerStore = ScriptViewerStore.init;

export const useInitScriptViewerStore = () => {
	useState(initScriptViewerStore);
};
