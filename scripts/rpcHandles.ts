#!/usr/bin/env bun
import { service } from '../server/src/service';

console.log(
	Object.keys(service)
		.map((k) => `\t'${k}',`)
		.join('\n')
);
