import { Database } from 'bun:sqlite';
import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import { files } from './schema';

const sqlite = new Database(process.env.DB_PATH, { safeIntegers: true });
const _db = drizzle(sqlite);

export const db = {
	insertFile: async (file: typeof files.$inferInsert) => {
		return (await _db.insert(files).values(file).returning()).map(
			bigintToNumber
		);
	},

	insertFiles: async (fileList: (typeof files.$inferInsert)[]) => {
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

	setFileVersion: async (id: number, version: number) => {
		return (
			await _db
				.update(files)
				.set({ version })
				.where(eq(files.id, id))
				.returning({ id: files.id, version: files.version })
		).map(bigintToNumber);
	},

	setFileAutorun: async (id: number, autorun: boolean) => {
		return (
			await _db
				.update(files)
				.set({ autorun })
				.where(eq(files.id, id))
				.returning({ id: files.id, autorun: files.autorun })
		).map(bigintToNumber);
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
