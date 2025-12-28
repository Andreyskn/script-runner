#!/usr/bin/env bun
import { Key } from 'ts-key-enum';

console.log(
	'declare global {\n',
	'\ttype Key =\n',
	Object.keys(Key)
		.map((k) => `\t| '${k}'`)
		.join('\n'),
	'}'
);
