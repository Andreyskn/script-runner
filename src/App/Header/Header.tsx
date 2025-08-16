import { memo } from 'react';

import { TerminalIcon } from 'lucide-react';

import { cls } from './Header.styles';

export type HeaderProps = {
	className?: string;
};

export const Header: React.FC<HeaderProps> = memo((props) => {
	const { className } = props;

	return (
		<div className={cls.header.block(null, className)}>
			<div className={cls.header.title()}>
				<TerminalIcon />
				Script Runner
			</div>
			{/* <Button icon='plus' text='New Script' /> */}
		</div>
	);
});
