import { useState } from 'react';

import { TrashIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { cls } from './Dates.styles';

export type DatesProps = {
	script: ScriptStore;
};

export const Dates: React.FC<DatesProps> = (props) => {
	const {
		script: {
			id,
			selectors: { schedule },
			createSchedule,
			addTriggerDate,
			deleteTriggerDate,
		},
	} = props;

	const [inputDate, setInputDate] = useState('');

	const handleSchedule = () => {
		if (!inputDate) {
			return;
		}

		const date = new Date(inputDate).toISOString();

		if (schedule) {
			addTriggerDate(inputDate);
		} else {
			createSchedule({ type: 'dates', date, scriptId: id });
		}

		setInputDate('');
	};

	return (
		<div className={cls.dates.block()}>
			<div className={cls.dates.title()}>Select Date</div>
			<Input
				type='datetime-local'
				className={cls.dates.dateInput()}
				min={new Date().toISOString().slice(0, 16)}
				value={inputDate}
				onChange={(e) => setInputDate(e.target.value)}
			/>
			<Button
				text='Schedule Run'
				fill='green'
				stretch
				disabled={!inputDate}
				onClick={handleSchedule}
			/>
			{!!schedule?.triggers.length && (
				<div className={cls.dates.title()}>
					Scheduled Runs ({schedule.triggers.length})
				</div>
			)}
			{schedule?.triggers.map((t) => (
				<div key={t.id} className={cls.dates.scheduledRun()}>
					{formatDate(t.date)}
					<Button
						icon={<TrashIcon size={16} />}
						borderless
						onClick={() => deleteTriggerDate(t.id)}
					/>
				</div>
			))}
		</div>
	);
};

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat(undefined, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};
