import { TerminalIcon } from 'lucide-react';

import { Section } from '@/components/Section';
import { HistoryEntry } from '@/views/History/HistoryEntry';

import { cls } from './History.styles';

export type HistoryProps = {};

export const History: React.FC<HistoryProps> = (props) => {
	const {} = props;

	return (
		<Section
			header={<Header />}
			headerClassName={cls.header.block()}
			contentClassName={cls.history.content()}
			className={cls.history.block()}
		>
			<HistoryEntry />
			{/* <Placeholder /> */}
		</Section>
	);
};

const Header: React.FC = () => {
	return (
		<>
			<div className={cls.header.title()}>Execution History</div>
			<div className={cls.header.subtitle()}>
				Recent script executions and their outputs
			</div>
			<div className={cls.header.counter()}>0 total</div>
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
