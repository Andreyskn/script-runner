import { useEffect, useRef } from 'react';

import { SpecialExitCodes } from '@server/common';
import { BanIcon, TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { Tooltip } from '@/components/Tooltip';
import {
	type ExecutionStatus,
	type OutputLine,
} from '@/views/Scripts/stores/scriptStore';

import type { File } from '../../stores/filesStore';
import { cls } from './Output.styles';

type Props = {
	script: File;
};

export const OutputSection: React.FC<Props> = ({ script }) => {
	const {
		scriptStore: {
			selectors: { output, executionStatus, exitCode, execCount },
			interruptExecution,
		},
	} = script;

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
						<Tooltip
							content='Interrupt'
							className={cls.header.interrupt()}
						>
							<Button
								icon={<BanIcon />}
								color='red'
								borderless
								size='small'
								onClick={interruptExecution}
							/>
						</Tooltip>
					)}
				</>
			}
		>
			{hasActiveExecution.current ? (
				<Output
					key={execCount}
					lines={output}
					exitCode={exitCode}
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
	exitCode: number | null;
	className?: string;
	autoScrollDisabled?: boolean;
};

export const Output: React.FC<OutputProps> = (props) => {
	const { lines, exitCode, name, className, status, autoScrollDisabled } =
		props;

	const lastLine = useRef<HTMLDivElement>(null);

	const hasStartedExecution = useRef(false);
	if (status === 'running') {
		hasStartedExecution.current = true;
	}

	useEffect(() => {
		if (!autoScrollDisabled) {
			lastLine.current?.scrollIntoView();
		}
	});

	const result = (() => {
		if (exitCode === null) {
			return null;
		}

		switch (exitCode) {
			case 0:
				return 'success';
			case SpecialExitCodes.Aborted:
				return 'interrupt';
			default:
				return 'fail';
		}
	})();

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
					ref={lastLine}
				>
					{line.text}
				</div>
			))}

			{result === 'success' && (
				<div className={cls.output.line({ success: true })}>
					✅ Script completed successfully
				</div>
			)}
			{result === 'fail' && (
				<div className={cls.output.line({ error: true })}>
					❌ Script failed with exit code: {exitCode}
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
