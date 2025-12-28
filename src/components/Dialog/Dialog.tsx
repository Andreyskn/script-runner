import { useEffect, useRef, useState } from 'react';

import { cls } from './Dialog.styles';
import { dialog, type DialogAPI } from './dialogApi';

export const Dialog: React.FC = () => {
	const [content, setContent] = useState<React.ReactNode>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const result = useRef<{ resolve: (v: any) => void }>(null);

	useEffect(() => {
		Object.assign(dialog, {
			open: (content: React.ReactNode) => {
				const { promise, resolve } = Promise.withResolvers<any>();
				result.current = { resolve };

				setContent(content);
				return promise;
			},
			close: () => {
				dialogRef.current?.close();
			},
			resolve: (data) => {
				result.current?.resolve(data);
				dialogRef.current?.close();
			},
		} satisfies DialogAPI);

		dialogRef.current?.addEventListener('close', () => {
			result.current?.resolve(undefined);
		});
	}, []);

	useEffect(() => {
		if (content) {
			dialogRef.current?.showModal();
		}
	}, [content]);

	return (
		<dialog
			// @ts-expect-error
			closedby='any'
			id='dialog'
			ref={dialogRef}
			className={cls.dialog.block()}
		>
			{content}
		</dialog>
	);
};
