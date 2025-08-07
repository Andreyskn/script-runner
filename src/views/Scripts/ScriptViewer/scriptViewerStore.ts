import { ComponentStore, getStoreInitHook, sleep } from '@/utils';

export type ExecutionResult = 'interrupt' | 'fail' | 'success';

export type ExecutionStatus = 'idle' | 'starting' | 'running' | 'ended';

type State = {
	isEditing: boolean;
	modifiedScriptContent: string;
	output: string[];
	executionStatus: ExecutionStatus;
	result: ExecutionResult | null;
};

class ScriptViewerStore extends ComponentStore<State> {
	state: State = {
		isEditing: false,
		modifiedScriptContent: '',
		output: [],
		executionStatus: 'idle',
		result: null,
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

	appendOutputLine = (text: string) => {
		this.setState((state) => {
			state.output = [...state.output, text];
		});
	};

	setExecutionStatus = (status: ExecutionStatus) => {
		this.setState((state) => {
			if (status === 'starting') {
				state.output = [];
			}

			state.executionStatus = status;
		});
	};

	setExecutionResult = (result: ExecutionResult) => {
		this.setState((state) => {
			state.executionStatus = 'ended';
			state.result = result;
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

		get executionResult() {
			return store.useSelector((state) => state.result);
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

			store.setExecutionResult('success');
		},
	} satisfies Partial<typeof store> & Record<string, any>;
};
