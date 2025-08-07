import { ComponentStore, getStoreInitHook, sleep } from '@/utils';

export type ExecutionResult = 'interrupted' | 'failed' | 'succeeded';

export type ExecutionStatus = 'idle' | 'starting' | 'running' | ExecutionResult;

// TODO: cache by script id

type State = {
	isEditing: boolean;
	modifiedScriptContent: string;
	output: string[];
	executionStatus: ExecutionStatus;
};

class ScriptViewerStore extends ComponentStore<State> {
	state: State = {
		isEditing: false,
		modifiedScriptContent: '',
		output: [],
		executionStatus: 'idle',
	};

	setEditing = (isEditing: boolean) => {
		this.setState((state) => {
			state.isEditing = isEditing;
		});
	};

	setModifiedScriptContent = (content: string) => {
		this.setState((state) => {
			state.modifiedScriptContent = content;
		});
	};

	clearOutput = () => {
		this.setState((state) => {
			state.output = [];
		});
	};

	appendOutputLine = (text: string) => {
		this.setState((state) => {
			state.output = [...state.output, text];
		});
	};

	setExecutionStatus = (status: ExecutionStatus) => {
		if (status === 'starting') {
			this.clearOutput();
		}

		this.setState((state) => {
			state.executionStatus = status;
		});
	};
}

const { getStore, useInitStore: useInitScriptViewerStore } =
	getStoreInitHook(ScriptViewerStore);

export { useInitScriptViewerStore };

export const useScriptViewerStore = () => {
	const store = getStore();
	const { state } = store;

	return {
		setEditing: store.setEditing,

		setScriptContent: store.setModifiedScriptContent,

		saveScript: () => {
			store.setEditing(false);

			if (!state.modifiedScriptContent) {
				return;
			}

			console.log(state.modifiedScriptContent);

			store.setModifiedScriptContent('');
		},

		get isEditing() {
			return store.useSelector((state) => state.isEditing);
		},

		get output() {
			return store.useSelector((state) => state.output);
		},

		get executionStatus() {
			return store.useSelector((state) => state.executionStatus);
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
