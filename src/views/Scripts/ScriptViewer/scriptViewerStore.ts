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

	#evSource: EventSource | undefined;
	#path: string;

	constructor(scriptPath: string) {
		super();
		this.#path = scriptPath;
	}

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

	execute = () => {
		this.setState((state) => {
			state.execCount++;
			state.executionStatus = 'idle';
			state.output = [];
			state.result = null;
		});

		this.#evSource = new EventSource(
			`http://localhost:3001/api/script/run?path=${this.#path}`
		);

		this.#evSource.onopen = () => {
			this.setExecutionStatus('running');
		};

		this.#evSource.onerror = (error) => {
			console.log(error);

			this.setExecutionStatus('disconnected');
			this.#evSource?.close();
		};

		this.#evSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as RunScriptData;

			if (data.isDone) {
				this.#evSource?.close();

				switch (true) {
					case data.code === 0: {
						this.setExecutionResult('success');
						break;
					}
					case typeof data.code === 'string': {
						this.appendOutputLine(data.code, true);
						this.setExecutionResult('fail');
						break;
					}
					default:
						this.setExecutionResult('fail');
				}
			} else {
				this.appendOutputLine(data.line, data.isError);
			}
		};
	};

	interruptExecution = () => {
		this.#evSource?.close();
		this.setExecutionResult('interrupt');
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

		runScript: store.execute,

		interrupt: store.interruptExecution,

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
	} satisfies Partial<typeof store> & Record<string, any>;
};
