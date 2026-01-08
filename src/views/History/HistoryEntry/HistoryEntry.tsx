import React, { useEffect, useState } from 'react';

import { SpecialExitCodes } from '@server/common';
import { ChevronRightIcon, ClockIcon, TerminalIcon } from 'lucide-react';
import ms from 'ms';

import { appStore } from '@/App/appStore';
import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import type { ArchiveStoreEntry } from '@/views/History/archiveStore';
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
	entry: ArchiveStoreEntry;
	lastUnseen?: boolean;
};

export const HistoryEntry: React.FC<HistoryEntryProps> = (props) => {
	const { entry, lastUnseen } = props;
	const {
		selectors: {
			active,
			fileId,
			startedAt,
			name,
			path,
			exitCode,
			endedAt,
			duration,
			hasOutput,
			output,
		},
		fetchOutput,
	} = entry;

	const { setSelectedScript } = filesStore;

	const [shouldShowOutput, setShowOutput] = useState(false);

	useEffect(() => {
		if (shouldShowOutput && !output) {
			fetchOutput();
		}
	}, [shouldShowOutput, output]);

	const goToScript = () => {
		appStore.setView('scripts');
		setSelectedScript(fileId);
		// TODO: notify if script is deleted
	};

	const result = (() => {
		switch (exitCode) {
			case undefined:
				return null;
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
						{active && <Loader size={10} />}
					</div>
					<div className={cls.title.name()} onClick={goToScript}>
						{name}
					</div>
					<div className={cls.title.path()}>{path}</div>
				</div>
				<div className={cls.info.block()}>
					<div className={cls.info.time()}>
						<ClockIcon size={12} />{' '}
						{formatDate(active ? startedAt : endedAt!)}
					</div>
					<div className={cls.info.duration()}>
						{active ? 'Running...' : <>Duration: {ms(duration!)}</>}
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
						text={hasOutput ? 'Show Output' : 'No Output'}
						icon={<TerminalIcon />}
						iconEnd={hasOutput && <ChevronRightIcon />}
						borderless
						className={cls.outputToggle.block({
							open: shouldShowOutput,
						})}
						onClick={() => setShowOutput((s) => !s)}
						disabled={!hasOutput}
					/>
				)}
			</div>
			{shouldShowOutput && (
				<div className={cls.historyEntry.outputWrapper()}>
					{output && (
						<>
							{output[0]?.order !== 0 && (
								<div
									className={cls.historyEntry.outputTruncated()}
								>
									Output truncated: first {output[0]?.order}{' '}
									lines skipped
								</div>
							)}
							<Output
								exitCode={exitCode!}
								lines={output}
								className={cls.historyEntry.output()}
							/>
						</>
					)}
				</div>
			)}
		</div>
	);
};
