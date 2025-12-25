import { SpecialExitCodes, type ScriptOutput } from '@server/types';

import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';
import { archiveStore } from '@/views/History/archiveStore';

export type ExecutionResult = 'interrupt' | 'fail' | 'success';
// TODO: move 'disconnected' status to appStore
// use websocket events to determine server availability
export type ExecutionStatus = 'idle' | 'disconnected' | 'running' | 'ended';

export type OutputLine = { text: string; isError: boolean };

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
	unwatchOutput: (() => void) | null = null;

	constructor(path: string, isRunning: boolean) {
		super();
		this.setPath(path);

		// TODO: read on first render and after ws content-change event
		api.readScript(path).then(this.setText);

		ws.subscribe('script-status', ({ path, status, timestamp }) => {
			if (path === this.path) {
				this.setExecutionStatus(status, timestamp);
			}
		});

		if (isRunning) {
			this.state.executionStatus = 'running';
			this.state.startedAt = new Date(); //TODO: actual date

			api.getScriptOutput(this.path, this.state.output.length).then(
				(output) => {
					output.forEach(this.handleOutput);
					archiveStore.setActive(this);
				}
			);
		}
	}

	// TODO: call it when the script is deleted
	cleanup = () => {
		this.unwatchOutput?.();
	};

	// TODO: call it again when this.path changes
	// or subscribe using script id instead of path
	watchOutput = () => {
		this.unwatchOutput?.();

		// TODO: detect and restore missing output lines
		this.unwatchOutput = ws.subscribe(
			`output:${this.path}`,
			({ output }) => {
				this.handleOutput(output);
			}
		);
	};

	handleOutput = (output: ScriptOutput) => {
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
			}
		}
	};

	setPath = (path: string) => {
		this.path = path;
		this.name = path.slice(path.lastIndexOf('/') + 1);
		this.watchOutput();
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

	setExecutionStatus = (status: ExecutionStatus, timestamp: string) => {
		this.setState((state) => {
			state.executionStatus = status;

			switch (status) {
				case 'running': {
					state.execCount++;
					state.output = [];
					state.result = null;
					state.startedAt = new Date(timestamp);
					state.endedAt = null;
					break;
				}
				case 'ended': {
					state.endedAt = new Date(timestamp);
					break;
				}
			}
		});
	};

	setExecutionResult = (result: ExecutionResult) => {
		this.setState((state) => {
			state.result = result;
		});

		archiveStore.setEnded(this);
	};

	execute = async () => {
		const hasStarted = await api
			.runScript(this.path)
			.catch((err: Error) => {
				this.appendOutputLine(err.message, true);
				return false;
			});

		if (!hasStarted) {
			if (import.meta.env.MODE === 'mock') {
				this.appendOutputLine(
					'No connection to Mock Service Worker',
					true
				);
			}
			return;
		}

		archiveStore.setActive(this);

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
