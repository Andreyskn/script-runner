import { TerminalIcon } from 'lucide-react';

import { Section } from '@/components/Section';
import { useScriptViewerStore } from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './Output.styles';

export type OutputProps = {};

export const Output: React.FC<OutputProps> = (props) => {
	const {} = props;

	const { output } = useScriptViewerStore();

	return (
		<Section
			card
			className={cls.output.block()}
			contentClassName={cls.output.content()}
			headerClassName={cls.output.header()}
			header={
				<>
					<TerminalIcon size={16} /> Terminal Output
				</>
			}
		>
			<div className={cls.output.placeholder()}>
				No output yet. Run a script to see results.
			</div>
		</Section>
	);
};
