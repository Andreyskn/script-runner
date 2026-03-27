import type { DefaultErrorSet, ErrorSet } from '@andrey/func';

export const errors = {
	noOutput: 'No output preserved',
	fileNotFound: 'File not found',
	versionTooLow: (version: number) =>
		`Version must be higher than ${version}`,
	fileNotRunnable: 'File not runnable',
} satisfies ErrorSet;

export type ServiceErrors = typeof errors & DefaultErrorSet;
