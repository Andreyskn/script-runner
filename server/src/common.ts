import { join } from 'node:path';
import { homedir } from 'os';

export const SCRIPTS_DIR = `${homedir()}/Projects/scripts`;

export const abs = (path: string) => join(SCRIPTS_DIR, path);
