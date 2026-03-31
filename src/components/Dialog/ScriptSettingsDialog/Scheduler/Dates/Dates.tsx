import { TrashIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

import { cls } from './Dates.styles';

export type DatesProps = {};

export const Dates: React.FC<DatesProps> = (props) => {
	const {} = props;

	return (
		<div className={cls.dates.block()}>
			<div className={cls.dates.title()}>Select Date</div>
			<Input type='datetime-local' className={cls.dates.dateInput()} />
			<Button
				text='Schedule Run'
				fill='green'
				stretch
				// disabled
				// onClick={() => }
			/>
			<div className={cls.dates.title()}>Scheduled Runs (2)</div>
			<div className={cls.dates.scheduledRun()}>
				4/30/2026 at 12:00
				<Button icon={<TrashIcon size={16} />} borderless />
			</div>
			<div className={cls.dates.scheduledRun()}>
				4/30/2026 at 12:00
				<Button icon={<TrashIcon size={16} />} borderless />
			</div>
		</div>
	);
};
