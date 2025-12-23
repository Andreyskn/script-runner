#!/usr/bin/env bun
import { service } from '../server/src/service';

console.log(
	`const RPC_HANDLES = [${Object.keys(service).map((k) => `'${k}'`)}] as const;`
);
