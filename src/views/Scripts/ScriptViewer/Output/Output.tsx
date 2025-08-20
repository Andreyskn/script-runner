import { useRef } from 'react';

import { TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import {
	useScriptViewerStore,
	type ExecutionResult,
	type ExecutionStatus,
	type OutputLine,
} from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './Output.styles';

export const OutputSection: React.FC = () => {
	const { output, executionStatus, executionResult, interrupt, execCount } =
		useScriptViewerStore();

	const hasActiveExecution = useRef(false);
	if (executionStatus !== 'idle') {
		hasActiveExecution.current = true;
	}

	return (
		<Section
			card
			className={cls.outputSection.block()}
			contentClassName={cls.outputSection.content()}
			headerClassName={cls.header.block()}
			header={
				<>
					<TerminalIcon size={16} /> Terminal Output
					{executionStatus === 'running' && (
						<Button
							icon='ban'
							color='red'
							borderless
							size='small'
							className={cls.header.interruptButton()}
							onClick={interrupt}
						/>
					)}
				</>
			}
		>
			{hasActiveExecution.current ? (
				<Output
					key={execCount}
					lines={output}
					result={executionResult}
					status={executionStatus}
					name='backup.sh'
				/>
			) : (
				<div className={cls.outputSection.placeholder()}>
					No output yet. Run the script to see results.
				</div>
			)}
		</Section>
	);
};

export type OutputProps = {
	name: string;
	lines: OutputLine[];
	status: ExecutionStatus;
	result: ExecutionResult | null;
	className?: string;
};

export const Output: React.FC<OutputProps> = (props) => {
	const { lines, result, name, className, status } = props;

	const hasStartedExecution = useRef(false);
	if (status === 'running') {
		hasStartedExecution.current = true;
	}

	return (
		<div className={cls.output.block(null, className)}>
			{hasStartedExecution.current && (
				<div
					className={cls.output.line({
						success: true,
						initial: true,
					})}
				>
					$ Executing {name}...
				</div>
			)}

			{lines.map((line, i) => (
				<div
					key={i}
					className={cls.output.line({ error: line.isError })}
				>
					{line.text}
				</div>
			))}

			{status === 'disconnected' && (
				<div className={cls.output.line({ error: true })}>
					🔌 Server error
				</div>
			)}

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
