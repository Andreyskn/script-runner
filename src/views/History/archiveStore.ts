import { ComponentStore } from '@/utils';
import type {
	ExecutionResult,
	OutputLine,
	ScriptStore,
} from '@/views/Scripts/stores/scriptStore';

export type ArchivedEntry = {
	result: ExecutionResult;
	output: OutputLine[];
	startedAt: Date;
	endedAt: Date;
	name: string;
	path: string;
};

type State = {
	active: Set<ScriptStore>;
	ended: Set<ArchivedEntry>;
	unseenCount: number;
};

class ArchiveStore extends ComponentStore<State> {
	state: State = {
		active: new Set(),
		ended: new Set(),
		unseenCount: 0,
	};

	setActive = (script: ScriptStore) => {
		const { execCount } = script.state;

		setTimeout(() => {
			if (
				script.state.execCount === execCount &&
				script.state.executionStatus === 'running'
			) {
				this.setState((state) => {
					state.active.add(script);
				});
			}
		}, 1000);
	};

	setEnded = (script: ScriptStore) => {
		this.setState((state) => {
			state.active.delete(script);

			state.ended.add({
				name: script.name,
				path: script.path,
				output: script.state.output,
				result: script.state.result!,
				startedAt: script.state.startedAt!,
				endedAt: script.state.endedAt!,
			});

			state.unseenCount++;
		});
	};

	clearUnseen = () => {
		this.setState((state) => {
			state.unseenCount = 0;
		});
	};
}

export const archiveStore = ArchiveStore.init();
