import { Database } from 'bun:sqlite';
import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import { files, schedules, triggers } from './schema';

const sqlite = new Database(process.env.DB_PATH, { safeIntegers: true });
const _db = drizzle(sqlite);

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

		deleteFile: async (id: number) => {
			return await _db.delete(files).where(eq(files.id, id));
		},

		deleteFiles: async (ids: number[]) => {
			return await _db.delete(files).where(inArray(files.id, ids));
		},

		updateFile: async (id: number, data: Partial<NewFile>) => {
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

		createTriggers: async (
			scheduleId: Schedule['id'],
			data: OmitType<NewTrigger, 'scheduleId'>[]
		) => {
			return (
				await _db
					.insert(triggers)
					.values(data.map((d) => ({ scheduleId, ...d })))
					.returning()
			).map(bigintToNumber);
		},

		deleteSchedule: async (id: number) => {
			return await _db.delete(schedules).where(eq(schedules.id, id));
		},

		deleteTrigger: async (id: number) => {
			return await _db.delete(triggers).where(eq(triggers.id, id));
		},

		deleteTriggerByScheduleId: async (scheduleId: number) => {
			return await _db
				.delete(triggers)
				.where(eq(triggers.scheduleId, scheduleId));
		},

		updateSchedule: async (id: number, data: Partial<NewSchedule>) => {
			return (
				await _db
					.update(schedules)
					.set(data)
					.where(eq(schedules.id, id))
					.returning()
			).map(bigintToNumber);
		},

		getScheduleById: async (id: number) => {
			return (
				await _db.select().from(schedules).where(eq(schedules.id, id))
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
