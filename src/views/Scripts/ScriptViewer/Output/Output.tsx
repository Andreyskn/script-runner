import { TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { Section } from '@/components/Section';
import {
	useScriptViewerStore,
	type ExecutionResult,
} from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './Output.styles';

export const OutputSection: React.FC = () => {
	const { output, executionStatus, executionResult } = useScriptViewerStore();

	return (
		<Section
			card
			className={cls.outputSection.block()}
			contentClassName={cls.outputSection.content()}
			headerClassName={cls.header.block()}
			header={
				<>
					<TerminalIcon size={16} /> Terminal Output
					{executionStatus === 'starting' && (
						<Loader className={cls.header.loader()} />
					)}
					{executionStatus === 'running' && (
						<Button
							icon='ban'
							color='red'
							borderless
							size='small'
							className={cls.header.interruptButton()}
						/>
					)}
				</>
			}
		>
			{executionStatus === 'idle' ? (
				<div className={cls.outputSection.placeholder()}>
					No output yet. Run the script to see results.
				</div>
			) : (
				<Output
					lines={output}
					result={executionResult}
					name='backup.sh'
				/>
			)}
		</Section>
	);
};

export type OutputProps = {
	name: string;
	lines: string[];
	result: ExecutionResult | null;
	className?: string;
};

export const Output: React.FC<OutputProps> = (props) => {
	const { lines, result, name, className } = props;

	return (
		<div className={cls.output.block(null, className)}>
			<div
				className={cls.output.line({
					success: true,
					initial: true,
				})}
			>
				$ Executing {name}...
			</div>

			{lines.map((line, i) => (
				<div key={i} className={cls.output.line()}>
					{line}
				</div>
			))}

			{result === 'success' && (
				<div className={cls.output.line({ success: true })}>
					✅ Script completed successfully
				</div>
			)}
			{result === 'fail' && (
				<div className={cls.output.line({ error: true })}>
					❌ Script failed
				</div>
			)}
			{result === 'interrupt' && (
				<div className={cls.output.line({ error: true })}>
					🚫 Script interrupted
				</div>
			)}
		</div>
	);
};
