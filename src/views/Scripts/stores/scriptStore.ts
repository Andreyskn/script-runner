import { ComponentStore } from '@/utils';

export type ExecutionResult = 'interrupt' | 'fail' | 'success';

export type ExecutionStatus = 'idle' | 'disconnected' | 'running' | 'ended';

export type OutputLine = { text: string; isError: boolean };

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

type State = {
	execCount: number;
	isEditing: boolean;
	modifiedText: string | null;
	text: string;
	output: OutputLine[];
	executionStatus: ExecutionStatus;
	result: ExecutionResult | null;
};

export class ScriptStore extends ComponentStore<State> {
	state: State = {
		execCount: 0,
		isEditing: false,
		modifiedText: null,
		text: '',
		output: [],
		executionStatus: 'idle',
		result: null,
	};

	#evSource: EventSource | undefined;

	path: string = '';
	name: string = '';

	constructor(path: string) {
		super();
		this.setPath(path);

		(async () => {
			const result = await fetch(
				`http://localhost:3001/api/script?path=${path}`
			);
			this.setText(await result.text());
		})();
	}

	setPath = (path: string) => {
		this.path = path;
		this.name = path.slice(path.lastIndexOf('/') + 1);
	};

	setEditing = (isEditing: boolean) => {
		this.setState((state) => {
			state.isEditing = isEditing;
		});
	};

	setText = (text: string) => {
		this.setState((state) => {
			state.text = text;
		});
	};

	setModifiedText = (text: string) => {
		this.setState((state) => {
			state.modifiedText = text;
		});
	};

	saveScriptText = () => {
		this.setState((state) => {
			state.isEditing = false;

			if (state.modifiedText !== null) {
				state.text = state.modifiedText;
				state.modifiedText = null;

				fetch(`http://localhost:3001/api/script`, {
					method: 'POST',
					body: JSON.stringify({
						path: this.path,
						text: state.text,
					}),
				});
			}
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
			`http://localhost:3001/api/script/run?path=${this.path}`
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
