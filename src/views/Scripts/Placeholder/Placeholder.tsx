import { TerminalIcon } from 'lucide-react';

import { cls } from './Placeholder.styles';

export type PlaceholderProps = {};

export const Placeholder: React.FC<PlaceholderProps> = () => {
	return (
		<div className={cls.placeholder.block()}>
			<div className={cls.placeholder.content()}>
				<TerminalIcon size={64} />
				<div className={cls.placeholder.title()}>
					No Script Selected
				</div>
				<div className={cls.placeholder.subtitle()}>
					Select a script from the sidebar to view and execute it
				</div>
			</div>
		</div>
	);
};
