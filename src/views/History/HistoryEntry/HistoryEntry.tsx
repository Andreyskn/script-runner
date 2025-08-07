import { useState } from 'react';

import { ClockIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Output } from '@/views/Scripts/ScriptViewer/Output';

import { cls } from './HistoryEntry.styles';

export type HistoryEntryProps = {};

export const HistoryEntry: React.FC<HistoryEntryProps> = (props) => {
	const {} = props;

	const [shouldShowOutput, setShowOutput] = useState(false);

	const output = [
		'Starting backup...',
		'Files backed up successfully!',
		'Backup completed!',
	];

	return (
		<div className={cls.historyEntry.block()}>
			<div className={cls.historyEntry.main()}>
				<div className={cls.title.block()}>
					<div className={cls.title.indicator({ success: true })} />
					<div className={cls.title.name()}>backup.sh</div>
					<div className={cls.title.path()}>automation/backup.sh</div>
				</div>
				<div className={cls.info.block()}>
					<div className={cls.info.time()}>
						<ClockIcon size={12} /> Aug 8, 01:23:28 AM
					</div>
					<div className={cls.info.duration()}>Duration: 306ms</div>
				</div>
				<div className={cls.actions.block()}>
					<Button icon='rotate-ccw' borderless size='small' />
					<Button icon='x' borderless size='small' color='red' />
				</div>
				<div className={cls.status.block({ success: true })}>
					Success
				</div>
				<Button
					text='Show Output'
					icon='terminal'
					iconEnd='chevron-right'
					borderless
					className={cls.outputToggle.block({
						open: shouldShowOutput,
					})}
					onClick={() => setShowOutput((s) => !s)}
				/>
			</div>
			{shouldShowOutput && (
				<div className={cls.historyEntry.outputWrapper()}>
					<Output
						name='backup.sh'
						result='success'
						lines={output}
						className={cls.historyEntry.output()}
					/>
				</div>
			)}
		</div>
	);
};
