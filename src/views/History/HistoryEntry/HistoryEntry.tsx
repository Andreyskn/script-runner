import { useState } from 'react';

import { SpecialExitCodes } from '@server/common';
import {
	ChevronRightIcon,
	ClockIcon,
	LoaderCircle,
	TerminalIcon,
} from 'lucide-react';
import ms from 'ms';

import { appStore } from '@/App/appStore';
import { Button } from '@/components/Button';
import type { ActiveEntry, ArchivedEntry } from '@/views/History/archiveStore';
import { Output } from '@/views/Scripts/ScriptViewer/Output';
import { filesStore } from '@/views/Scripts/stores/filesStore';

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
	entry: ArchivedEntry | ActiveEntry;
	lastUnseen?: boolean;
};

export const HistoryEntry: React.FC<HistoryEntryProps> = (props) => {
	const { entry, lastUnseen } = props;
	const { active, execId, fileId, name, path, startedAt } = entry;

	const { setSelectedScript } = filesStore;

	const [shouldShowOutput, setShowOutput] = useState(false);

	const goToScript = () => {
		appStore.setView('scripts');
		setSelectedScript(fileId);
	};

	const result =
		!active &&
		(() => {
			switch (entry.exitCode) {
				case 0:
					return 'success';
				case SpecialExitCodes.Aborted:
					return 'interrupt';
				default:
					return 'fail';
			}
		})();

	return (
		<div className={cls.historyEntry.block({ lastUnseen })}>
			<div className={cls.historyEntry.main({ active })}>
				<div className={cls.title.block()}>
					<div
						className={cls.title.indicator({
							success: result === 'success',
							fail: result === 'fail',
							loader: active,
						})}
					>
						{active && <LoaderCircle size={10} />}
					</div>
					<div className={cls.title.name()} onClick={goToScript}>
						{entry.name}
					</div>
					<div className={cls.title.path()}>{entry.path}</div>
				</div>
				<div className={cls.info.block()}>
					<div className={cls.info.time()}>
						<ClockIcon size={12} />{' '}
						{formatDate(active ? startedAt! : entry.endedAt)}
					</div>
					<div className={cls.info.duration()}>
						{active ? (
							'Running...'
						) : (
							<>
								Duration:{' '}
								{ms(+entry.endedAt - +entry.startedAt)}
							</>
						)}
					</div>
				</div>
				{!active && (
					<div
						className={cls.status.block({
							success: result === 'success',
							fail: result === 'fail',
						})}
					>
						{result === 'fail' && 'Fail'}
						{result === 'success' && 'Success'}
						{result === 'interrupt' && 'Interrupt'}
					</div>
				)}
				{!active && (
					<Button
						text={entry.hasOutput ? 'Show Output' : 'No Output'}
						icon={<TerminalIcon />}
						iconEnd={entry.hasOutput && <ChevronRightIcon />}
						borderless
						className={cls.outputToggle.block({
							open: shouldShowOutput,
						})}
						onClick={() => setShowOutput((s) => !s)}
						disabled={!entry.hasOutput}
					/>
				)}
			</div>
			{shouldShowOutput && !active && (
				<div className={cls.historyEntry.outputWrapper()}>
					<Output
						name='backup.sh'
						exitCode={null}
						status='ended'
						lines={[
							{
								text: 'Output fetching is not implemented',
								isError: true,
							},
						]}
						className={cls.historyEntry.output()}
						autoScrollDisabled
					/>
				</div>
			)}
		</div>
	);
};
