import { useEffect } from 'react';

import { TerminalIcon } from 'lucide-react';

import { Section } from '@/components/Section';
import { HistoryEntry } from '@/views/History/HistoryEntry';
import { archiveStore } from '@/views/History/archiveStore';

import { cls } from './History.styles';

export type HistoryProps = {
	active?: boolean;
};

export const History: React.FC<HistoryProps> = (props) => {
	const { active } = props;

	const {
		clearUnseen,
		useSelector,
		selectors: { unseenCount },
	} = archiveStore;

	const entries = useSelector(
		(state) => (active ? state.active : state.ended),
		(set) => [...set].reverse()
	);

	useEffect(() => {
		if (!active) {
			return clearUnseen;
		}
	}, []);

	return (
		<Section
			header={<Header count={entries.length} />}
			headerClassName={cls.header.block()}
			contentClassName={cls.history.content()}
			className={cls.history.block()}
		>
			{entries.length ? (
				entries.map((entry, i) => (
					<HistoryEntry
						key={i}
						entry={entry}
						lastUnseen={
							unseenCount !== entries.length &&
							i + 1 === unseenCount
						}
					/>
				))
			) : (
				<Placeholder />
			)}
		</Section>
	);
};

const Header: React.FC<{ count: number }> = ({ count }) => {
	return (
		<>
			<div className={cls.header.title()}>Execution History</div>
			<div className={cls.header.subtitle()}>
				Recent script executions and their outputs
			</div>
			<div className={cls.header.counter()}>{count} total</div>
		</>
	);
};

const Placeholder: React.FC = () => {
	return (
		<div className={cls.placeholder.block()}>
			<TerminalIcon size={48} />
			<div className={cls.placeholder.title()}>No executions yet</div>
			<div className={cls.placeholder.subtitle()}>
				Run some scripts to see their execution history here
			</div>
		</div>
	);
};
