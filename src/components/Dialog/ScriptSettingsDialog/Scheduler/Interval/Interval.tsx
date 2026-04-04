import { useState } from 'react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

import { cls } from './Interval.styles';

export type IntervalProps = {};

export const Interval: React.FC<IntervalProps> = (props) => {
	const {} = props;

	const [seconds, setSeconds] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [hours, setHours] = useState(0);
	const [days, setDays] = useState(0);
	const [weeks, setWeeks] = useState(0);
	const [months, setMonths] = useState(0);

	const [unlimited, setUnlimited] = useState(true);
	const [autoFirstRun, setAutoFirstRun] = useState(true);

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
					onChange={(e) => setSeconds(Number(e.target.value))}
				/>
				<Input
					id='interval-m'
					placeholder='0'
					type='integer'
					size='small'
					onChange={(e) => setMinutes(Number(e.target.value))}
				/>
				<Input
					id='interval-h'
					placeholder='0'
					type='integer'
					size='small'
					onChange={(e) => setHours(Number(e.target.value))}
				/>
				<label htmlFor='interval-d'>Days</label>
				<label htmlFor='interval-w'>Weeks</label>
				<label htmlFor='interval-mon'>Months</label>
				<Input
					id='interval-d'
					placeholder='0'
					type='integer'
					size='small'
					onChange={(e) => setDays(Number(e.target.value))}
				/>
				<Input
					id='interval-w'
					placeholder='0'
					type='integer'
					size='small'
					onChange={(e) => setWeeks(Number(e.target.value))}
				/>
				<Input
					id='interval-mon'
					placeholder='0'
					type='integer'
					size='small'
					onChange={(e) => setMonths(Number(e.target.value))}
				/>
			</div>
			<div className={cls.interval.title()}>Times to Run</div>
			<div className={cls.interval.btnRow()}>
				<Button
					text='Unlimited'
					color={unlimited ? 'green' : 'none'}
					onClick={() => setUnlimited(true)}
				/>
				<Button
					text='Set Limit'
					color={!unlimited ? 'green' : 'none'}
					onClick={() => setUnlimited(false)}
				/>
				{!unlimited && (
					<Input
						placeholder='Number of runs'
						type='integer'
						autoFocus
						size='small'
						wrapperClassName={cls.interval.inputWrap()}
					/>
				)}
			</div>
			<div className={cls.interval.title()}>Next Run</div>
			<div className={cls.interval.btnRow()}>
				<Button
					text='Auto'
					color={autoFirstRun ? 'green' : 'none'}
					onClick={() => setAutoFirstRun(true)}
				/>
				<Button
					text='Set Date'
					color={!autoFirstRun ? 'green' : 'none'}
					onClick={() => setAutoFirstRun(false)}
				/>
				{!autoFirstRun && (
					<Input
						type='datetime-local'
						autoFocus
						size='small'
						wrapperClassName={cls.interval.inputWrap()}
						onFocus={(e) => e.target.showPicker()}
					/>
				)}
			</div>
			<Button
				text='Save Interval Schedule'
				fill='green'
				stretch
				className={cls.interval.saveBtn()}
				// disabled
				// onClick={() => }
			/>
		</div>
	);
};
