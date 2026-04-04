import { useState } from 'react';

import { CalendarIcon, RepeatIcon } from 'lucide-react';

import { Button } from '@/components/Button';

import { Dates } from './Dates';
import { Interval } from './Interval';
import { cls } from './Scheduler.styles';

export type SchedulerProps = {};

export const Scheduler: React.FC<SchedulerProps> = (props) => {
	const {} = props;
	const [selected, setSelected] = useState<'disabled' | 'interval' | 'dates'>(
		'disabled'
	);

	// TODO: prompt before disabling the schedule

	return (
		<div className={cls.scheduler.block()}>
			<Button
				text='Disabled'
				fill={selected === 'disabled' ? 'green' : 'none'}
				onClick={() => setSelected('disabled')}
			/>
			<Button
				text='Interval'
				fill={selected === 'interval' ? 'green' : 'none'}
				icon={<RepeatIcon size={16} />}
				onClick={() => setSelected('interval')}
			/>
			<Button
				text='Dates'
				fill={selected === 'dates' ? 'green' : 'none'}
				icon={<CalendarIcon size={16} />}
				onClick={() => setSelected('dates')}
			/>
			{(() => {
				switch (selected) {
					case 'interval':
						return (
							<div className={cls.scheduler.content()}>
								<Interval />
							</div>
						);
					case 'dates':
						return (
							<div className={cls.scheduler.content()}>
								<Dates />
							</div>
						);
					default:
						return null;
				}
			})()}
		</div>
	);
};
