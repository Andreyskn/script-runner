/// <reference types="vite/client" />
import type { LucideProps } from 'lucide-react';

declare global {
	type Icon = React.ReactElement<LucideProps>;

	type NonRenderable = false | '' | null | undefined;

	type NonRenderableOptions<T> = {
		[K in keyof T]: undefined extends T[K] ? T[K] | NonRenderable : T[K];
	};
}
