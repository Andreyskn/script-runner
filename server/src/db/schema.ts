import { sql } from 'drizzle-orm';
import {
	blob,
	customType,
	integer,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';

import type { Duration } from '../schedules';

const timestampMsInteger = customType<{
	data: Date;
	driverData: bigint;
}>({
	dataType() {
		return 'INTEGER';
	},
	toDriver(value: Date): bigint {
		return BigInt(value.getTime());
	},
	fromDriver(value: bigint): Date {
		return new Date(Number(value));
	},
});

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
	createdAt: timestampMsInteger('created_at')
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: timestampMsInteger('updated_at')
		.notNull()
		.$onUpdate(() => sql`(unixepoch() * 1000)`),
});

export const triggers = sqliteTable('triggers', {
	id: integer().primaryKey({ autoIncrement: true }),
	scheduleId: integer('schedule_id')
		.references(() => schedules.id)
		.notNull(),
	triggerAt: timestampMsInteger('trigger_at').notNull(),
});
