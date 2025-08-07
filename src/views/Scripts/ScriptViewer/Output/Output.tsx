import { TerminalIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Loader } from '@/components/Loader';
import { Section } from '@/components/Section';
import { useScriptViewerStore } from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './Output.styles';

export type OutputProps = {};

export const Output: React.FC<OutputProps> = (props) => {
	const {} = props;

	const { output, executionStatus } = useScriptViewerStore();

	return (
		<Section
			card
			className={cls.output.block()}
			contentClassName={cls.output.content()}
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
							text='Interrupt'
							color='red'
							borderless
							className={cls.header.interruptButton()}
						/>
					)}
				</>
			}
		>
			{executionStatus === 'idle' ? (
				<div className={cls.output.placeholder()}>
					No output yet. Run the script to see results.
				</div>
			) : (
				<>
					<div
						className={cls.output.line({
							success: true,
							initial: true,
						})}
					>
						$ Executing backup.sh...
					</div>

					{output.map((line, i) => (
						<div key={i} className={cls.output.line()}>
							{line}
						</div>
					))}

					{executionStatus === 'succeeded' && (
						<div className={cls.output.line({ success: true })}>
							✅ Script completed successfully
						</div>
					)}
					{executionStatus === 'failed' && (
						<div className={cls.output.line({ error: true })}>
							❌ Script failed
						</div>
					)}
					{executionStatus === 'interrupted' && (
						<div className={cls.output.line({ error: true })}>
							🚫 Script interrupted
						</div>
					)}
				</>
			)}
		</Section>
	);
};
