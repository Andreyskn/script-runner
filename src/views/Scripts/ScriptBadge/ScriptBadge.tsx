import type { FileId } from '@server/files';
import { ClockIcon, ZapIcon } from 'lucide-react';

import { Tooltip } from '@/components/Tooltip';

import { filesStore } from '../stores/filesStore';
import { cls } from './ScriptBadge.styles';

export type ScriptBadgeProps = {
	id: FileId;
	className?: string;
};

export const ScriptBadge: React.FC<ScriptBadgeProps> = (props) => {
	const { id, className } = props;

	const file = filesStore.state.files.get(id)!;

	if (file.type !== 'script') {
		return null;
	}

	const {
		selectors: { autorun },
	} = file.scriptStore;

	if (autorun) {
		return (
			<>
				<Tooltip
					content='Autorun'
					className={cls.scriptBadge.block(null, className)}
				>
					<ZapIcon size={12} />
				</Tooltip>
				<Tooltip
					content='Scheduled'
					className={cls.scriptBadge.block(
						{ schedule: true },
						className
					)}
				>
					<ClockIcon size={12} />
				</Tooltip>
			</>
		);
	}

	return null;
};
