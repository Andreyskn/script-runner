import { memo } from 'react';

import { SettingsIcon, TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { showAppSettingsDialog } from '@/components/Dialog/AppSettingsDialog';

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
			<Button
				icon={<SettingsIcon size={16} />}
				onClick={() => showAppSettingsDialog({})}
			/>
		</div>
	);
});
