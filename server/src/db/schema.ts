import { sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
	id: integer().primaryKey({ autoIncrement: true }),
	inode: blob({ mode: 'bigint' }).notNull().unique(),
	version: integer().default(0).notNull(),
	autorun: integer({ mode: 'boolean' }).notNull().default(false),
});

export const schedules = sqliteTable('schedules', {
	id: integer().primaryKey({ autoIncrement: true }),
	destination: text().notNull(),
	payload: text().notNull(),
	intervalMs: integer('interval_ms'), // NULL for one-time
	repeatTimes: integer('repeat_times'), // NULL for infinite
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$onUpdate(() => sql`(unixepoch() * 1000)`),
});

export const triggers = sqliteTable('triggers', {
	id: integer().primaryKey({ autoIncrement: true }),
	scheduleId: integer('schedule_id')
		.references(() => schedules.id)
		.notNull(),
	triggerAt: integer('trigger_at', { mode: 'timestamp_ms' }).notNull(),
});
