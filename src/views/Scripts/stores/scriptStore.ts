import { type ScriptOutput, type ScriptOutputMetadata } from '@server/common';
import type { FileId } from '@server/files';
import type { ExecData, ExecId } from '@server/runner';
import type { ClientScheduleData, CreateScheduleData } from '@server/schedules';

import { api, ws } from '@/api';
import { ComponentStore } from '@/utils';

export type ExecutionStatus = 'idle' | 'running' | 'ended';

export type OutputLine = {
	text: string;
	isError: boolean;
} & ScriptOutputMetadata;

export type Schedule = Replace<
	ClientScheduleData,
	{
		triggers: Replace<
			ClientScheduleData['triggers'][number],
			{
				date: Date;
			}
		>[];
	}
>;

type State = {
	execId: ExecId;
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
	autorun: boolean;
	scheduleId: number | null;
	schedule: Schedule | null;
};

export class ScriptStore extends ComponentStore<State> {
	state: State = {
		execId: -1,
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
		autorun: false,
		scheduleId: null,
		schedule: null,
	};

	disposables: (() => void)[] = [];

	constructor(
		public id: FileId,
		autorun: boolean,
		scheduleId: number | null,
		runningSince?: string
	) {
		super();

		this.state.autorun = autorun;
		this.state.scheduleId = scheduleId;

		this.packState({
			id,
			pack: () => {
				const { isEditing, modifiedText } = this.state;

				if (!isEditing) {
					return;
				}

				return {
					isEditing,
					modifiedText,
				};
			},
			unpack: (data) => {
				const { isEditing, modifiedText } = data;

				this.state.isEditing = isEditing;
				this.state.modifiedText = modifiedText;
			},
		});

		if (runningSince) {
			this.state.executionStatus = 'running';
			this.state.startedAt = new Date(runningSince);

			api.getScriptOutput(this.id).then((result) => {
				if (!result.ok) {
					return;
				}

				result.value.forEach(this.appendOutputLine);
			});
		}

		this.disposables.push(
			ws.subscribe('script-status', (data) => {
				if (data.fileId === this.id) {
					this.setExecutionStatus(data);
				}
			}),
			ws.subscribe(`output:${this.id}`, ({ output }) => {
				this.appendOutputLine(output);
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

	appendOutputLine = (value: ScriptOutput) => {
		const { line, order, timestamp, type } = value;
		this.setState((state) => {
			state.output.push({
				isError: type === 'stderr',
				text: line,
				order,
				timestamp,
			});
		});
	};

	setExecutionStatus = (data: ExecData) => {
		this.setState((state) => {
			state.executionStatus = data.active ? 'running' : 'ended';

			if (data.active) {
				state.execId = data.execId;
				state.output = [];
				state.exitCode = null;
				state.startedAt = new Date(data.startedAt);
				state.endedAt = null;
			} else {
				state.endedAt = new Date(data.endedAt);
				state.exitCode = data.exitCode;
			}
		});
	};

	execute = async () => {
		const result = await api.runScript(this.id);

		if (!result.ok) {
			this.appendOutputLine({
				line: result.error.message,
				order: 0,
				timestamp: new Date().toISOString(),
				type: 'stderr',
			});
			return false;
		}
	};

	interruptExecution = () => {
		api.abortScript(this.id);
	};

	setAutorun = async (id: FileId, autorun: boolean) => {
		const result = await api.setScriptAutorun(id, autorun);

		if (!result.ok) {
			// TODO: show notification
			return;
		}

		this.setState((s) => {
			s.autorun = autorun;
		});
	};

	fetchSchedule = async () => {
		if (!this.state.scheduleId || this.state.schedule) {
			return;
		}

		const result = await api.getSchedule(this.state.scheduleId);

		if (!result.ok) {
			return;
		}

		this.setState((s) => {
			if (result.value) {
				s.schedule = {
					...result.value,
					triggers: result.value.triggers.map((t) => ({
						...t,
						date: new Date(t.date),
					})),
				};
			} else {
				s.scheduleId = null;
			}
		});
	};

	createSchedule = async (data: CreateScheduleData) => {
		const result = await api.createSchedule(data);

		if (!result.ok) {
			return;
		}

		this.setState((s) => {
			s.scheduleId = result.value.id;
			s.schedule = {
				...result.value,
				triggers: result.value.triggers.map((t) => ({
					...t,
					date: new Date(t.date),
				})),
			};
		});
	};

	deleteSchedule = async () => {
		if (!this.state.scheduleId) {
			return;
		}

		const result = await api.deleteSchedule(this.state.scheduleId);

		if (!result.ok) {
			return;
		}

		this.setState((s) => {
			s.scheduleId = null;
			s.schedule = null;
		});
	};

	addTriggerDate = async (date: string) => {
		const scheduleId = this.state.schedule?.id;

		if (!scheduleId) {
			return;
		}

		const result = await api.createTriggerDate({ scheduleId, date });

		if (!result.ok) {
			return;
		}

		this.setState((s) => {
			s.schedule = {
				...s.schedule!,
				triggers: [
					...s.schedule!.triggers,
					{ date: new Date(date), id: result.value },
				].sort((a, b) => +a.date - +b.date),
			};
		});
	};

	deleteTriggerDate = async (triggerId: number) => {
		const result = await api.deleteTriggerDate(triggerId);

		if (!result.ok) {
			return;
		}

		this.setState((s) => {
			if (s.schedule?.triggers.length === 1) {
				s.scheduleId = null;
				s.schedule = null;
			} else {
				s.schedule = {
					...s.schedule!,
					triggers: s.schedule!.triggers.filter(
						(t) => t.id !== triggerId
					),
				};
			}
		});
	};
}
