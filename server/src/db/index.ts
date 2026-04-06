import { createClient } from '@libsql/client';
import { eq, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';

import { files, schedules, triggers } from './schema';

const client = createClient({ url: process.env.DB_PATH, intMode: 'bigint' });
const _db = drizzle({ client });

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
export type Trigger = typeof triggers.$inferSelect;
export type NewTrigger = typeof triggers.$inferInsert;

export const db = {
	files: {
		insertFiles: async (fileList: NewFile[]) => {
			return (await _db.insert(files).values(fileList).returning()).map(
				bigintToNumber
			);
		},

		getAllFiles: async () => {
			return (await _db.select().from(files)).map(bigintToNumber);
		},

		deleteFile: async (id: File['id']) => {
			return await _db.delete(files).where(eq(files.id, id));
		},

		deleteFiles: async (ids: File['id'][]) => {
			return await _db.delete(files).where(inArray(files.id, ids));
		},

		updateFile: async (id: File['id'], data: Partial<NewFile>) => {
			return (
				await _db
					.update(files)
					.set(data)
					.where(eq(files.id, id))
					.returning()
			).map(bigintToNumber);
		},
	},
	schedules: {
		createSchedule: async (data: NewSchedule) => {
			return (await _db.insert(schedules).values(data).returning()).map(
				bigintToNumber
			)[0]!;
		},

		createTrigger: async (data: NewTrigger) => {
			return (await _db.insert(triggers).values(data).returning()).map(
				bigintToNumber
			)[0]!;
		},

		deleteSchedule: async (id: Schedule['id']) => {
			return (
				await _db
					.delete(schedules)
					.where(eq(schedules.id, id))
					.returning()
			).map(bigintToNumber)[0];
		},

		deleteTrigger: async (id: Trigger['id']) => {
			return (
				await _db
					.delete(triggers)
					.where(eq(triggers.id, id))
					.returning()
			).map(bigintToNumber)[0];
		},

		deleteTriggersByScheduleId: async (scheduleId: Schedule['id']) => {
			return (
				await _db
					.delete(triggers)
					.where(eq(triggers.scheduleId, scheduleId))
					.returning()
			).map(bigintToNumber);
		},

		updateSchedule: async (
			id: Schedule['id'],
			data: Partial<NewSchedule>
		) => {
			return (
				await _db
					.update(schedules)
					.set(data)
					.where(eq(schedules.id, id))
					.returning()
			).map(bigintToNumber)[0]!;
		},

		incrementScheduleRunsLeft: async (scheduleId: Schedule['id']) => {
			return await _db
				.update(schedules)
				.set({
					runsLeft: sql`${schedules.runsLeft} + 1`,
				})
				.where(eq(schedules.id, scheduleId));
		},

		decrementScheduleRunsLeft: async (scheduleId: Schedule['id']) => {
			return await _db
				.update(schedules)
				.set({
					runsLeft: sql`${schedules.runsLeft} - 1`,
				})
				.where(eq(schedules.id, scheduleId));
		},

		getScheduleById: async (id: Schedule['id']) => {
			return (
				await _db.select().from(schedules).where(eq(schedules.id, id))
			).map(bigintToNumber)[0];
		},

		getTriggersByScheduleId: async (scheduleId: Schedule['id']) => {
			return (
				await _db
					.select()
					.from(triggers)
					.where(eq(triggers.scheduleId, scheduleId))
					.orderBy(triggers.triggerAt)
			).map(bigintToNumber);
		},

		getTriggerById: async (id: Trigger['id']) => {
			return (
				await _db.select().from(triggers).where(eq(triggers.id, id))
			).map(bigintToNumber)[0];
		},

		getNextTrigger: async () => {
			return (
				await _db
					.select()
					.from(triggers)
					.orderBy(triggers.triggerAt)
					.limit(1)
			).map(bigintToNumber)[0];
		},
	},
};

const bigintToNumber = <T extends Record<string, unknown>>(row: T) => {
	return Object.fromEntries(
		Object.entries(row).map(([k, v]) => {
			if (typeof v === 'bigint' && k !== 'inode') {
				return [k, Number(v)];
			}
			return [k, v];
		})
	) as T;
};
