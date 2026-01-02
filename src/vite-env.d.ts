/// <reference types="vite/client" />
import type { LucideProps } from 'lucide-react';

declare global {
	interface ImportMetaEnv {
		VITE_IP: string;
		VITE_PORT: string;
	}

	type Icon = React.ReactElement<LucideProps>;

	type NonRenderable = false | '' | null | undefined;

	type NonRenderableOptions<T> = {
		[K in keyof T]: undefined extends T[K] ? T[K] | NonRenderable : T[K];
	};
}
