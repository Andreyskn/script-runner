import { ComponentStore, getStoreInitHook } from '@/utils';

export type ExecutionResult = 'interrupt' | 'fail' | 'success';

export type ExecutionStatus = 'idle' | 'disconnected' | 'running' | 'ended';

export type OutputLine = { text: string; isError: boolean };

type State = {
	execCount: number;
	isEditing: boolean;
	modifiedScriptContent: string;
	output: OutputLine[];
	executionStatus: ExecutionStatus;
	result: ExecutionResult | null;
};

class ScriptViewerStore extends ComponentStore<State> {
	state: State = {
		execCount: 0,
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

	appendOutputLine = (text: string, isError: boolean) => {
		this.setState((state) => {
			state.output = [...state.output, { isError, text }];
		});
	};

	setExecutionStatus = (status: ExecutionStatus) => {
		this.setState((state) => {
			state.executionStatus = status;
		});
	};

	setExecutionResult = (result: ExecutionResult) => {
		this.setState((state) => {
			state.executionStatus = 'ended';
			state.result = result;
		});
	};

	clearExecution = () => {
		this.setState((state) => {
			state.execCount++;
			state.executionStatus = 'idle';
			state.output = [];
			state.result = null;
		});
	};
}

type RunScriptData =
	| {
			isDone: false;
			isError: boolean;
			line: string;
	  }
	| {
			isDone: true;
			code: number | string;
	  };

const { getStore, useInitStore: useInitScriptViewerStore } =
	getStoreInitHook(ScriptViewerStore);

export { useInitScriptViewerStore };

let eventSource: EventSource | undefined;

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

		get execCount() {
			return store.useSelector((state) => state.execCount);
		},

		interruptScript: () => {
			eventSource?.close();
			store.setExecutionResult('interrupt');
		},

		// TODO: move to store
		runScript: async () => {
			store.clearExecution();

			eventSource = new EventSource('http://localhost:3001/api/script');

			eventSource.onopen = () => {
				store.setExecutionStatus('running');
			};

			eventSource.onerror = () => {
				store.setExecutionStatus('disconnected');
				eventSource?.close();
			};

			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data) as RunScriptData;

				if (data.isDone) {
					eventSource?.close();

					switch (true) {
						case data.code === 0: {
							store.setExecutionResult('success');
							break;
						}
						case typeof data.code === 'string': {
							store.appendOutputLine(data.code, true);
							store.setExecutionResult('fail');
							break;
						}
						default:
							store.setExecutionResult('fail');
					}
				} else {
					store.appendOutputLine(data.line, data.isError);
				}
			};
		},
	} satisfies Partial<typeof store> & Record<string, any>;
};
