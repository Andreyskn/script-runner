import { func, type AsyncFuncGen, type DefaultErrorSet } from '@andrey/func';
import { Temporal } from 'temporal-polyfill';

import { db, type Schedule, type Trigger } from './db';
import { errors, type ServiceErrors } from './errors';
import { files, type FileId } from './files';
import { runner } from './runner';

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
	date: DateISO;
};

export type CreateTriggerData = {
	scheduleId: Schedule['id'];
	date: DateISO;
};

type GetScheduleResult = Pick<Schedule, 'id' | 'scriptId' | 'interval'> & {
	triggers: { id: Trigger['id']; date: DateISO }[];
};

export const schedules = {
	createSchedule: func(async function* (
		data: CreateScheduleData
	): AsyncFuncGen<
		{ scheduleId: Schedule['id']; triggerId: Trigger['id'] },
		DefaultErrorSet
	> {
		const { defer } = schedules.createSchedule.utils;

		let triggerAt: Date;

		yield* defer((error) => {
			if (error) {
				return;
			}

			pendingTrigger.compareAndProcessEarliest(triggerAt);
		});

		switch (data.type) {
			case 'dates': {
				triggerAt = new Date(data.date);

				const schedule = await db.schedules.createSchedule({
					scriptId: data.scriptId,
				});
				const trigger = await db.schedules.createTrigger({
					scheduleId: schedule.id,
					triggerAt,
				});

				await files.setScheduleId(data.scriptId, schedule.id).try();

				return {
					scheduleId: schedule.id,
					triggerId: trigger.id,
				};
			}
			case 'interval': {
				const { scriptId, interval, firstRun, runCount } = data;
				const schedule = await db.schedules.createSchedule({
					scriptId,
					interval,
					runsLeft: runCount,
				});

				let trigger: Trigger;

				if (firstRun) {
					triggerAt = new Date(firstRun);
					trigger = await db.schedules.createTrigger({
						scheduleId: schedule.id,
						triggerAt,
					});
				} else {
					const now = Temporal.Now.zonedDateTimeISO();
					triggerAt = new Date(now.add(interval).toString());
					trigger = await db.schedules.createTrigger({
						scheduleId: schedule.id,
						triggerAt,
					});
				}

				await files.setScheduleId(data.scriptId, schedule.id).try();

				return {
					scheduleId: schedule.id,
					triggerId: trigger.id,
				};
			}
		}
	}),

	createTriggerDate: func(async function* (
		data: CreateTriggerData
	): AsyncFuncGen<Trigger['id'], DefaultErrorSet> {
		const triggerAt = new Date(data.date);
		const trigger = await db.schedules.createTrigger({
			scheduleId: data.scheduleId,
			triggerAt,
		});

		pendingTrigger.compareAndProcessEarliest(triggerAt);

		return trigger.id;
	}),

	deleteTriggerDate: func(async function* (
		triggerId: Trigger['id']
	): AsyncFuncGen<
		boolean,
		Pick<ServiceErrors, 'scheduleNotFound' | 'triggerNotFound'>
	> {
		yield {
			scheduleNotFound: errors.scheduleNotFound,
			triggerNotFound: errors.triggerNotFound,
		};
		const { error } = schedules.deleteTriggerDate.utils;

		const trigger = await db.schedules.getTriggerById(triggerId);

		if (!trigger) {
			throw yield* error.triggerNotFound();
		}

		await db.schedules.deleteTrigger(triggerId);

		const schedule = await db.schedules.getScheduleById(trigger.scheduleId);

		if (!schedule) {
			throw yield* error.scheduleNotFound();
		}

		if (schedule.runsLeft === null) {
			return true;
		}

		if (schedule.runsLeft === 1) {
			await db.schedules.deleteSchedule(schedule.id);
		} else {
			await db.schedules.updateSchedule(schedule.id, {
				runsLeft: schedule.runsLeft - 1,
			});
		}

		pendingTrigger.cancelDeletedTrigger(triggerId);

		return true;
	}),

	deleteSchedule: func(async function* (
		scheduleId: Schedule['id']
	): AsyncFuncGen<boolean, DefaultErrorSet> {
		const deletedSchedule = await db.schedules.deleteSchedule(scheduleId);

		if (!deletedSchedule) {
			return true;
		}

		pendingTrigger.cancelDeletedTrigger(-1, scheduleId);
		await files.setScheduleId(deletedSchedule.scriptId, null).try();

		return true;
	}),

	getSchedule: func(async function* (
		scheduleId: Schedule['id']
	): AsyncFuncGen<GetScheduleResult | null, DefaultErrorSet> {
		const schedule = await db.schedules.getScheduleById(scheduleId);

		if (!schedule) {
			return null;
		}

		const triggers = await db.schedules.getTriggersByScheduleId(
			schedule.id
		);

		return {
			id: schedule.id,
			interval: schedule.interval,
			scriptId: schedule.scriptId,
			triggers: triggers.map((t) => ({
				id: t.id,
				date: t.triggerAt.toISOString(),
			})),
		};
	}),
};

const executeTrigger = async (
	triggerId: Trigger['id'],
	scheduleId: Schedule['id'],
	scriptId: FileId
) => {
	runner.runScript(scriptId).try();
	await schedules.deleteTriggerDate(triggerId).try();

	const schedule = await db.schedules.getScheduleById(scheduleId);

	if (schedule?.interval) {
		const now = Temporal.Now.zonedDateTimeISO();

		const trigger = await db.schedules.createTrigger({
			scheduleId: schedule.id,
			triggerAt: new Date(now.add(schedule.interval).toString()),
		});

		pendingTrigger.compareAndProcessEarliest(trigger.triggerAt);
	}
};

type PendingTriggerData = {
	timeout: NodeJS.Timeout;
	scheduleId: Schedule['id'];
	scriptId: FileId;
	triggerId: Trigger['id'];
	triggerAt: Date;
};

const pendingTrigger = {
	data: null as PendingTriggerData | null,
	ready: Promise.withResolvers(),

	clear: () => {
		clearTimeout(pendingTrigger.data?.timeout);
		pendingTrigger.ready.resolve();
		pendingTrigger.data = null;
		pendingTrigger.ready = Promise.withResolvers();
	},

	compareAndProcessEarliest: async (triggerAt: Date) => {
		await pendingTrigger.ready.promise;

		if (!pendingTrigger.data || triggerAt < pendingTrigger.data.triggerAt) {
			processNextTrigger();
		}
	},

	cancelDeletedTrigger: async (
		triggerId: Trigger['id'],
		scheduleId?: Schedule['id']
	) => {
		await pendingTrigger.ready.promise;

		if (!pendingTrigger.data) {
			return;
		}

		if (
			triggerId === pendingTrigger.data.triggerId ||
			scheduleId === pendingTrigger.data.scheduleId
		) {
			pendingTrigger.clear();
		}
	},
};

const processNextTrigger = func(async function* (): AsyncFuncGen<
	void,
	DefaultErrorSet
> {
	const { defer } = processNextTrigger.utils;

	yield* defer(() => {
		pendingTrigger.ready.resolve();
	});

	pendingTrigger.clear();

	const trigger = await db.schedules.getNextTrigger();

	if (!trigger) {
		return;
	}

	const schedule = await db.schedules.getScheduleById(trigger.scheduleId);

	if (!schedule) {
		await db.schedules.deleteTrigger(trigger.id);
		return;
	}

	const timeout = setTimeout(async () => {
		try {
			await executeTrigger(trigger.id, schedule.id, schedule.scriptId);
		} catch (error) {}

		processNextTrigger();
	}, +trigger.triggerAt - +new Date());

	pendingTrigger.data = {
		triggerId: trigger.id,
		scheduleId: schedule.id,
		scriptId: schedule.scriptId,
		triggerAt: trigger.triggerAt,
		timeout,
	};
});

processNextTrigger();
