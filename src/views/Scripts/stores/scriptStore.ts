import { ComponentStore } from '@/utils';
import { archiveStore } from '@/views/History/archiveStore';

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
	startedAt: Date | null;
	endedAt: Date | null;
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
		startedAt: null,
		endedAt: null,
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

			switch (state.modifiedText) {
				case null:
					break;
				case state.text: {
					state.modifiedText = null;
					break;
				}
				default: {
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
			state.endedAt = new Date();
		});

		archiveStore.setEnded(this);
	};

	execute = () => {
		this.setState((state) => {
			state.execCount++;
			state.executionStatus = 'idle';
			state.output = [];
			state.result = null;
			state.startedAt = new Date();
			state.endedAt = null;
		});

		archiveStore.setActive(this);

		this.#evSource = new EventSource(
			`http://localhost:3001/api/script/run?path=${this.path}`
		);

		this.#evSource.onopen = () => {
			this.setExecutionStatus('running');

			if (import.meta.env.MODE === 'mock') {
				const scriptChannel = new BroadcastChannel(
					'script-runner-mock'
				);
				scriptChannel.postMessage({
					type: 'SCRIPT_TEXT',
					text: this.state.text,
					path: this.path,
				});
				scriptChannel.close();
			}
		};

		this.#evSource.onerror = () => {
			if (import.meta.env.MODE === 'mock') {
				this.appendOutputLine(
					'No connection to Mock Service Worker',
					true
				);
			}
			this.setExecutionStatus('disconnected');
			this.#evSource?.close();
		};

		this.#evSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as RunScriptData;

			if (data.isDone) {
				this.#evSource?.close();

				// TODO: numeric codes only, add exit code to state.result

				const { code, isNumeric } = (() => {
					const num =
						typeof data.code === 'number' ? data.code : +data.code;
					const isNumeric =
						typeof data.code === 'number' ||
						(!isNaN(num) && num.toString() === data.code);

					return { isNumeric, code: isNumeric ? num : data.code };
				})() as
					| { isNumeric: true; code: number }
					| { isNumeric: false; code: string };

				if (!isNumeric) {
					this.appendOutputLine(code, true);
					this.setExecutionResult('fail');
					return;
				}

				if (code !== 0) {
					this.appendOutputLine(`Exit code: ${data.code}`, true);
					this.setExecutionResult('fail');
					return;
				}

				this.setExecutionResult('success');
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
