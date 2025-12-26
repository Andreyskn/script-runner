import { type ScriptOutput } from '@server/common';
import type { FileId } from '@server/files';

import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';

// TODO: move 'disconnected' status to appStore
// use websocket events to determine server availability
export type ExecutionStatus = 'idle' | 'disconnected' | 'running' | 'ended';

export type OutputLine = { text: string; isError: boolean };

type State = {
	execCount: number;
	isEditing: boolean;
	modifiedText: string | null;
	text: string;
	textVersion: number;
	serverTextVersion: number;
	output: OutputLine[];
	executionStatus: ExecutionStatus;
	exitCode: number | null;
	startedAt: Date | null;
	endedAt: Date | null;
};

export class ScriptStore extends ComponentStore<State> {
	state: State = {
		execCount: 0,
		isEditing: false,
		modifiedText: null,
		text: '',
		textVersion: -1,
		serverTextVersion: 0,
		output: [],
		executionStatus: 'idle',
		exitCode: null,
		startedAt: null,
		endedAt: null,
	};

	disposables: (() => void)[] = [];

	constructor(
		public id: FileId,
		runningSince?: string
	) {
		super();

		if (runningSince) {
			this.state.executionStatus = 'running';
			this.state.startedAt = new Date(runningSince);

			api.getScriptOutput(this.id).then((result) => {
				if (!result.ok) {
					return;
				}

				result.value.forEach(this.handleOutput);
			});
		}

		this.disposables.push(
			ws.subscribe('script-status', ({ id, status, timestamp }) => {
				if (id === this.id) {
					this.setExecutionStatus(status, timestamp);
				}
			}),
			ws.subscribe(`output:${this.id}`, ({ output }) => {
				this.handleOutput(output);
			}),
			ws.subscribe('files-change', (data) => {
				if (data.type === 'script-content' && data.id === this.id) {
					this.setState((s) => {
						s.serverTextVersion = data.version;
					});
				}
			})
		);
	}

	fetchText = async () => {
		if (this.state.textVersion >= this.state.serverTextVersion) {
			return;
		}

		const result = await api.readScript(this.id);

		if (!result.ok) {
			return;
		}

		this.setState((state) => {
			state.text = result.value.text;
			state.textVersion = result.value.version;
			state.serverTextVersion = result.value.version;
		});
	};

	cleanup = () => {
		this.disposables.forEach((dispose) => dispose());
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
				this.setState((state) => {
					state.exitCode = output.code;
				});
			}
		}
	};

	setEditing = (isEditing: boolean) => {
		this.setState((state) => {
			state.isEditing = isEditing;
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
					state.textVersion++;

					api.updateScript(
						this.id,
						state.text,
						state.textVersion
					).then((result) => {
						if (
							!result.ok &&
							result.error.kind === 'versionTooLow'
						) {
							// TODO: handle error
						}
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

	setExecutionStatus = (status: ExecutionStatus, timestamp: string) => {
		this.setState((state) => {
			state.executionStatus = status;

			switch (status) {
				case 'running': {
					state.execCount++;
					state.output = [];
					state.exitCode = null;
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

	execute = async () => {
		const hasStarted = await api.runScript(this.id).catch((err: Error) => {
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

		if (import.meta.env.MODE === 'mock') {
			const scriptChannel = new BroadcastChannel('script-runner-mock');
			scriptChannel.postMessage({
				type: 'SCRIPT_TEXT',
				text: this.state.text,
				path: '', // this.path
			});
			scriptChannel.close();
		}
	};

	interruptExecution = () => {
		api.abortScript(this.id);
	};
}
