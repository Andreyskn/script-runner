import { blob, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
	id: integer().primaryKey({ autoIncrement: true }),
	inode: blob({ mode: 'bigint' }).notNull().unique(),
	version: integer().default(0).notNull(),
	autorun: integer({ mode: 'boolean' }).notNull().default(false),
});
