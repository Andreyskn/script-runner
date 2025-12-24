import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';
import { archiveStore } from '@/views/History/archiveStore';

export type ExecutionResult = 'interrupt' | 'fail' | 'success';

export type ExecutionStatus = 'idle' | 'disconnected' | 'running' | 'ended';

export type OutputLine = { text: string; isError: boolean };

// TODO: import from server
const enum SpecialExitCodes {
	FailedToStart = 1000,
	Aborted = 1001,
}

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

	path: string = '';
	name: string = '';

	constructor(path: string) {
		super();
		this.setPath(path);

		(async () => {
			const text = await api.readScript(path);
			this.setText(text);
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

					api.updateScript(this.path, state.text);
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

	execute = async () => {
		this.setState((state) => {
			state.execCount++;
			state.executionStatus = 'idle';
			state.output = [];
			state.result = null;
			state.startedAt = new Date();
			state.endedAt = null;
		});

		const unsubscribe = ws.subscribe(`output:${this.path}`, (output) => {
			switch (output.type) {
				case 'stdout': {
					this.appendOutputLine(output.line, false);
					break;
				}
				case 'stderr': {
					this.appendOutputLine(output.line, true);
					break;
				}
				case 'exit': {
					switch (output.code) {
						case 0: {
							this.setExecutionResult('success');
							break;
						}
						case SpecialExitCodes.Aborted: {
							this.setExecutionResult('interrupt');
							break;
						}
						default: {
							this.setExecutionResult('fail'); // TODO: show exit code
						}
					}

					unsubscribe();
					break;
				}
			}
		});

		const hasStarted = await api
			.runScript(this.path)
			.catch((err: Error) => {
				this.appendOutputLine(err.message, true);
				this.setExecutionStatus('disconnected');
				return false;
			});

		if (!hasStarted) {
			if (import.meta.env.MODE === 'mock') {
				this.appendOutputLine(
					'No connection to Mock Service Worker',
					true
				);
			}
			unsubscribe();
			return;
		}

		archiveStore.setActive(this);
		this.setExecutionStatus('running');

		if (import.meta.env.MODE === 'mock') {
			const scriptChannel = new BroadcastChannel('script-runner-mock');
			scriptChannel.postMessage({
				type: 'SCRIPT_TEXT',
				text: this.state.text,
				path: this.path,
			});
			scriptChannel.close();
		}
	};

	interruptExecution = () => {
		api.abortScript(this.path);
	};
}
