import { sql } from 'drizzle-orm';
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { Duration } from '../schedules';

export const files = sqliteTable('files', {
	id: integer().primaryKey({ autoIncrement: true }),
	inode: blob({ mode: 'bigint' }).notNull().unique(),
	version: integer().default(0).notNull(),
	autorun: integer({ mode: 'boolean' }).notNull().default(false),
	scheduleId: integer('schedule_id'),
});

export const schedules = sqliteTable('schedules', {
	id: integer().primaryKey({ autoIncrement: true }),
	scriptId: integer('script_id').notNull(),
	interval: text({ mode: 'json' }).$type<Duration>(), // NULL for one-time
	runsLeft: integer('runs_left'), // NULL for infinite
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
