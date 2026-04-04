import { type CallReturn } from '@andrey/func';
import type { JsonValue } from 'typed-rpc/server';

import { archive } from './archive';
import type { Schedule, Trigger } from './db';
import type { ServiceErrors } from './errors';
import { files, type FileId } from './files';
import { runner, type ExecId } from './runner';
import {
	schedules,
	type CreateScheduleData,
	type CreateTriggerData,
} from './schedules';

export type Service = typeof service;

// (Link to client API)[/home/andrey/Projects/script-runner/src/api/index.ts]
export const service = {
	getFilesList: async () => {
		return files.getClientFileList().result();
	},
	moveFile: async (id: FileId, newPath: string) => {
		return files.moveFile(id, newPath).result();
	},
	deleteFile: async (id: FileId) => {
		return files.deleteFile(id).result();
	},
	createFolder: async (path: string) => {
		return files.createFolder(path).result();
	},
	createScript: async (path: string) => {
		return files.createScript(path).result();
	},
	updateScript: async (id: FileId, text: string, version: number) => {
		return files.updateScript(id, text, version).result();
	},
	readScript: async (id: FileId) => {
		return files.readScript(id).result();
	},
	setScriptAutorun: async (id: FileId, autorun: boolean) => {
		return files.setAutorun(id, autorun).result();
	},
	runScript: async (id: FileId) => {
		return runner.runScript(id).result();
	},
	abortScript: async (id: FileId) => {
		return runner.abortScript(id).result();
	},
	getScriptOutput: async (execId: ExecId) => {
		return runner.getScriptOutput(execId).result();
	},
	getActiveScripts: async () => {
		return runner.getActiveScripts().result();
	},
	getArchivedExecs: async () => {
		return archive.getArchivedExecs().result();
	},
	getSchedule: async (scheduleId: Schedule['id']) => {
		return schedules.getSchedule(scheduleId).result();
	},
	createSchedule: async (data: CreateScheduleData) => {
		return schedules.createSchedule(data).result();
	},
	deleteSchedule: async (scheduleId: Schedule['id']) => {
		return schedules.deleteSchedule(scheduleId).result();
	},
	createTriggerDate: async (data: CreateTriggerData) => {
		return schedules.createTriggerDate(data).result();
	},
	deleteTriggerDate: async (triggerId: Trigger['id']) => {
		return schedules.deleteTriggerDate(triggerId).result();
	},
} satisfies Record<
	string,
	(
		...args: any[]
	) => Promise<CallReturn<(...args: any[]) => JsonValue, ServiceErrors>>
>;

export const publicMethods: (keyof Service)[] =
	process.env.NODE_ENV === 'development'
		? (Object.keys(service) as (keyof Service)[])
		: [
				'getFilesList',
				'readScript',
				'runScript',
				'abortScript',
				'getActiveScripts',
				'getArchivedExecs',
				'getScriptOutput',
			];
