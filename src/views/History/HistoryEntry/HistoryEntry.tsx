import { useState } from 'react';

import { ClockIcon, LoaderCircle } from 'lucide-react';
import ms from 'ms';

import { appStore } from '@/App/appStore';
import { Button } from '@/components/Button';
import type { ArchivedEntry } from '@/views/History/archiveStore';
import { Output } from '@/views/Scripts/ScriptViewer/Output';
import { FilesStore } from '@/views/Scripts/stores/filesStore';
import {
	ScriptStore,
	type ExecutionResult,
} from '@/views/Scripts/stores/scriptStore';

import { cls } from './HistoryEntry.styles';

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	}).format(date);
};

export type HistoryEntryProps = {
	entry: ArchivedEntry | ScriptStore;
	lastUnseen?: boolean;
};

export const HistoryEntry: React.FC<HistoryEntryProps> = (props) => {
	const { entry, lastUnseen } = props;

	const isActive = entry instanceof ScriptStore;

	const { setSelectedScript } = FilesStore.use();

	const [shouldShowOutput, setShowOutput] = useState(false);

	const goToScript = () => {
		appStore.setView('scripts');
		setSelectedScript(entry.path);
	};

	return (
		<div className={cls.historyEntry.block({ lastUnseen })}>
			<div className={cls.historyEntry.main({ active: isActive })}>
				<div className={cls.title.block()}>
					<div
						className={cls.title.indicator({
							success: !isActive && entry.result === 'success',
							fail: !isActive && entry.result === 'fail',
							loader: isActive,
						})}
					>
						{isActive && <LoaderCircle size={10} />}
					</div>
					<div className={cls.title.name()} onClick={goToScript}>
						{entry.name}
					</div>
					<div className={cls.title.path()}>{entry.path}</div>
				</div>
				<div className={cls.info.block()}>
					<div className={cls.info.time()}>
						<ClockIcon size={12} />{' '}
						{formatDate(
							isActive ? entry.state.startedAt! : entry.endedAt
						)}
					</div>
					<div className={cls.info.duration()}>
						{isActive ? (
							'Running...'
						) : (
							<>
								Duration:{' '}
								{ms(+entry.endedAt - +entry.startedAt)}
							</>
						)}
					</div>
				</div>
				{!isActive && (
					<div
						className={cls.status.block({
							success: entry.result === 'success',
							fail: entry.result === 'fail',
						})}
					>
						{
							(
								{
									fail: 'Fail',
									interrupt: 'Interrupt',
									success: 'Success',
								} as Record<ExecutionResult, string>
							)[entry.result]
						}
					</div>
				)}
				{!isActive && (
					<Button
						text={entry.output.length ? 'Show Output' : 'No Output'}
						icon='terminal'
						iconEnd={entry.output.length > 0 && 'chevron-right'}
						borderless
						className={cls.outputToggle.block({
							open: shouldShowOutput,
						})}
						onClick={() => setShowOutput((s) => !s)}
						disabled={!entry.output.length}
					/>
				)}
			</div>
			{shouldShowOutput && !isActive && (
				<div className={cls.historyEntry.outputWrapper()}>
					<Output
						name='backup.sh'
						result={null}
						status='ended'
						lines={entry.output}
						className={cls.historyEntry.output()}
						autoScrollDisabled
					/>
				</div>
			)}
		</div>
	);
};
