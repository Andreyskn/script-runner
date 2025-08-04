import { memo } from 'react';
import { cls } from './Header.styles';

export type HeaderProps = {
	className?: string;
};

export const Header: React.FC<HeaderProps> = memo((props) => {
	const { className } = props;

	return <div className={cls.header.block(null, className)}>Header</div>;
});
