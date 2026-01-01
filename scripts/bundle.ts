import { $ } from 'bun';

await Promise.all([
	$`bunx --bun vite build --mode prod`,
	$`bun build ./electron/src/main.ts --outdir ./electron/build --target node --packages external`,
	$`bun build ./electron/src/preload/*.ts --outdir ./electron/build --target node --format cjs --external electron`,
]);
