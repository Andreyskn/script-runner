import { useEffect, useState } from 'react';

import type { Duration } from '@server/scheduler';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { cls } from './Interval.styles';

type Interval = Record<
	keyof Pick<
		Duration,
		'days' | 'hours' | 'minutes' | 'seconds' | 'months' | 'weeks'
	>,
	string
>;

const EMPTY_INTERVAL: Interval = {
	days: '',
	hours: '',
	minutes: '',
	months: '',
	seconds: '',
	weeks: '',
};

export type IntervalProps = {
	script: ScriptStore;
};

export const Interval: React.FC<IntervalProps> = (props) => {
	const {
		script: {
			id,
			selectors: { schedule },
			createSchedule,
			deleteSchedule,
		},
	} = props;

	const [interval, setInterval] = useState<Interval>(EMPTY_INTERVAL);
	const [unlimited, setUnlimited] = useState(true);
	const [autoNextRun, setAutoNextRun] = useState(true);
	const [runCount, setRunCount] = useState(0);
	const [nextRunDate, setNextRunDate] = useState('');

	useEffect(() => {
		if (!schedule) {
			setInterval(EMPTY_INTERVAL);
			setUnlimited(true);
			setAutoNextRun(true);
			setRunCount(0);
			setNextRunDate('');
			return;
		}

		const interval: Interval = {
			seconds: schedule.interval?.seconds?.toString() ?? '',
			minutes: schedule.interval?.minutes?.toString() ?? '',
			hours: schedule.interval?.hours?.toString() ?? '',
			days: schedule.interval?.days?.toString() ?? '',
			weeks: schedule.interval?.weeks?.toString() ?? '',
			months: schedule.interval?.months?.toString() ?? '',
		};

		if (schedule.interval?.milliseconds) {
			interval.seconds = `${interval.seconds || 0}.${schedule.interval.milliseconds}`;
		}

		setInterval(interval);

		if (schedule.runsLeft) {
			setUnlimited(false);
			setRunCount(schedule.runsLeft);
		}

		const nextRun = schedule.triggers[0]?.date;

		if (nextRun) {
			const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
			setAutoNextRun(false);
			setNextRunDate(
				Temporal.ZonedDateTime.from(
					new Date(nextRun).toISOString() + `[${systemTZ}]`
				)
					.toString()
					.slice(0, 16)
			);
		}
	}, [schedule]);

	const handleIntervalChange = (
		unit: keyof Interval,
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setInterval((iv) => ({ ...iv, [unit]: e.target.value }));
	};

	const handleScheduleSave = async () => {
		if (schedule) {
			await deleteSchedule();
		}

		let milliseconds: number | undefined;

		const duration: Duration = Object.fromEntries(
			Object.entries(interval)
				.filter(([_, v]) => !!v)
				.map(([k, v]) => {
					if (k === 'seconds') {
						const [s, ms] = v.split('.');
						if (ms) {
							milliseconds = Number(ms.padEnd(3, '0'));
						}
						return [k, Number(s)];
					}
					return [k, Number(v)];
				})
		);

		if (milliseconds) {
			duration.milliseconds = milliseconds;
		}

		createSchedule({
			type: 'interval',
			scriptId: id,
			interval: duration,
			firstRun: nextRunDate
				? new Date(nextRunDate).toISOString()
				: undefined,
			runCount: runCount || undefined,
		});
	};

	return (
		<div className={cls.interval.block()}>
			<div className={cls.interval.title()}>Interval Duration</div>
			<div className={cls.interval.duration()}>
				<label htmlFor='interval-s'>Seconds</label>
				<label htmlFor='interval-m'>Minutes</label>
				<label htmlFor='interval-h'>Hours</label>
				<Input
					id='interval-s'
					placeholder='0.000'
					type='float'
					size='small'
					value={interval.seconds}
					onChange={handleIntervalChange.bind(null, 'seconds')}
					disabled={!!schedule}
				/>
				<Input
					id='interval-m'
					placeholder='0'
					type='integer'
					size='small'
					value={interval.minutes}
					onChange={handleIntervalChange.bind(null, 'minutes')}
					disabled={!!schedule}
				/>
				<Input
					id='interval-h'
					placeholder='0'
					type='integer'
					size='small'
					value={interval.hours}
					onChange={handleIntervalChange.bind(null, 'hours')}
					disabled={!!schedule}
				/>
				<label htmlFor='interval-d'>Days</label>
				<label htmlFor='interval-w'>Weeks</label>
				<label htmlFor='interval-mon'>Months</label>
				<Input
					id='interval-d'
					placeholder='0'
					type='integer'
					size='small'
					value={interval.days}
					onChange={handleIntervalChange.bind(null, 'days')}
					disabled={!!schedule}
				/>
				<Input
					id='interval-w'
					placeholder='0'
					type='integer'
					size='small'
					value={interval.weeks}
					onChange={handleIntervalChange.bind(null, 'weeks')}
					disabled={!!schedule}
				/>
				<Input
					id='interval-mon'
					placeholder='0'
					type='integer'
					size='small'
					value={interval.months}
					onChange={handleIntervalChange.bind(null, 'months')}
					disabled={!!schedule}
				/>
			</div>
			<div className={cls.interval.title()}>Times to Run</div>
			<div className={cls.interval.btnRow()}>
				<Button
					text='Unlimited'
					color={unlimited ? 'green' : 'none'}
					onClick={() => {
						setUnlimited(true);
						setRunCount(0);
					}}
					disabled={!!schedule}
				/>
				<Button
					text='Set Limit'
					color={!unlimited ? 'green' : 'none'}
					onClick={() => setUnlimited(false)}
					disabled={!!schedule}
				/>
				{!unlimited && (
					<Input
						placeholder='Number of runs'
						type='integer'
						size='small'
						wrapperClassName={cls.interval.inputWrap()}
						value={runCount || ''}
						onChange={(e) => setRunCount(Number(e.target.value))}
						disabled={!!schedule}
					/>
				)}
			</div>
			<div className={cls.interval.title()}>Next Run</div>
			<div className={cls.interval.btnRow()}>
				<Button
					text='Auto'
					color={autoNextRun ? 'green' : 'none'}
					onClick={() => {
						setAutoNextRun(true);
						setNextRunDate('');
					}}
					disabled={!!schedule}
				/>
				<Button
					text='Set Date'
					color={!autoNextRun ? 'green' : 'none'}
					onClick={() => setAutoNextRun(false)}
					disabled={!!schedule}
				/>
				{!autoNextRun && (
					<Input
						type='datetime-local'
						size='small'
						wrapperClassName={cls.interval.inputWrap()}
						min={new Date().toISOString().slice(0, 16)}
						value={nextRunDate}
						onChange={(e) => setNextRunDate(e.target.value)}
						disabled={!!schedule}
					/>
				)}
			</div>
			{schedule ? (
				<Button
					text='Cancel Schedule'
					color='red'
					stretch
					className={cls.interval.saveBtn()}
					onClick={deleteSchedule}
				/>
			) : (
				<Button
					text='Save Schedule'
					fill='green'
					stretch
					className={cls.interval.saveBtn()}
					disabled={Object.values(interval).every((v) => {
						const n = Number(v);
						return Number.isNaN(n) || n === 0;
					})}
					onClick={handleScheduleSave}
				/>
			)}
		</div>
	);
};
