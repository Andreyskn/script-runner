import { func, type AsyncFuncGen } from '@andrey/func';
import { Temporal } from 'temporal-polyfill';

import { db, type Schedule, type Trigger } from './db';
import { errors, type ServiceErrors } from './errors';
import type { FileId } from './files';

export type Duration = {
	years?: number;
	months?: number;
	weeks?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
	milliseconds?: number;
	microseconds?: number;
	nanoseconds?: number;
};

type DateISO = string;

export type CreateScheduleData = {
	scriptId: FileId;
} & (CreateIntervalSchedule | CreateDatesSchedule);

type CreateIntervalSchedule = {
	type: 'interval';
	interval: Duration;
	runCount?: number;
	firstRun?: DateISO;
};

type CreateDatesSchedule = {
	type: 'dates';
	dates: DateISO[];
};

export const schedules = {
	create: func(async function* (
		data: CreateScheduleData
	): AsyncFuncGen<
		{ scheduleId: Schedule['id']; triggerIds: Trigger['id'][] },
		Pick<ServiceErrors, 'fileNotFound'>
	> {
		yield {
			fileNotFound: errors.fileNotFound,
		};
		const { error } = schedules.create.utils;

		// TODO: validation, errors

		switch (data.type) {
			case 'dates': {
				const schedule = await db.schedules.createSchedule({
					payload: data.scriptId,
				});
				const triggers = await db.schedules.createTriggers(
					schedule.id,
					data.dates.map((d) => ({ triggerAt: new Date(d) }))
				);

				await db.files.updateFile(data.scriptId, {
					scheduleId: schedule.id,
				});

				return {
					scheduleId: schedule.id,
					triggerIds: triggers.map((t) => t.id),
				};
			}
			case 'interval': {
				const { scriptId, interval, firstRun, runCount } = data;
				const schedule = await db.schedules.createSchedule({
					payload: scriptId,
					interval,
					runsLeft: runCount,
				});

				let trigger: Trigger;

				if (firstRun) {
					trigger = (
						await db.schedules.createTriggers(schedule.id, [
							{ triggerAt: new Date(firstRun) },
						])
					)[0]!;
				} else {
					const now = Temporal.Now.zonedDateTimeISO();
					const triggerAt = new Date(now.add(interval).toString());
					trigger = (
						await db.schedules.createTriggers(schedule.id, [
							{ triggerAt },
						])
					)[0]!;
				}

				await db.files.updateFile(data.scriptId, {
					scheduleId: schedule.id,
				});

				return {
					scheduleId: schedule.id,
					triggerIds: [trigger.id],
				};
			}
		}
	}),
	addTriggerDate: 1,
	deleteTriggerDate: 1,
	cancelSchedule: 1,
	getSchedule: 1,
};

// TODO: process triggers
