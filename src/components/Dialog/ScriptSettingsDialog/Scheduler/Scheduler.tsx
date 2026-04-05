import { useEffect, useState } from 'react';

import { CalendarIcon, RepeatIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { Dates } from './Dates';
import { Interval } from './Interval';
import { cls } from './Scheduler.styles';

export type SchedulerProps = {
	script: ScriptStore;
};

export const Scheduler: React.FC<SchedulerProps> = (props) => {
	const {
		script,
		script: {
			selectors: { schedule, isStaleSchedule },
			fetchSchedule,
			deleteSchedule,
		},
	} = props;

	const [tab, setTab] = useState<'disabled' | 'interval' | 'dates'>(
		'disabled'
	);

	useEffect(() => {
		if (schedule?.type) {
			setTab(schedule.type);
		}
	}, [schedule?.type]);

	useEffect(() => {
		fetchSchedule();
	}, [schedule, isStaleSchedule]);

	// TODO: prompt before disabling the schedule

	return (
		<div className={cls.scheduler.block()}>
			<Button
				text='Disabled'
				fill={tab === 'disabled' ? 'green' : 'none'}
				onClick={() => {
					setTab('disabled');
					deleteSchedule();
				}}
			/>
			<Button
				text='Interval'
				fill={tab === 'interval' ? 'green' : 'none'}
				icon={<RepeatIcon size={16} />}
				onClick={() => setTab('interval')}
			/>
			<Button
				text='Dates'
				fill={tab === 'dates' ? 'green' : 'none'}
				icon={<CalendarIcon size={16} />}
				onClick={() => setTab('dates')}
			/>
			{(() => {
				switch (tab) {
					case 'interval':
						return (
							<div className={cls.scheduler.content()}>
								<Interval script={script} />
							</div>
						);
					case 'dates':
						return (
							<div className={cls.scheduler.content()}>
								<Dates script={script} />
							</div>
						);
					default:
						return null;
				}
			})()}
		</div>
	);
};
