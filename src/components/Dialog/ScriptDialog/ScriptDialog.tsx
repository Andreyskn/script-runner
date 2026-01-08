import { useEffect, useState } from 'react';

import { SpecialExitCodes } from '@server/common';
import {
	BanIcon,
	ChevronRightIcon,
	FileTextIcon,
	PlayIcon,
	PlusIcon,
} from 'lucide-react';

import { Button } from '@/components/Button';
import { Output } from '@/views/Scripts/ScriptViewer/Output';
import type { File } from '@/views/Scripts/stores/filesStore';

import { dialog } from '../dialogApi';
import { cls } from './ScriptDialog.styles';

export type ScriptDialogProps = {
	script: File;
};

export const ScriptDialog: React.FC<ScriptDialogProps> = (props) => {
	const {
		name,
		scriptStore: {
			state,
			execute,
			interruptExecution,
			fetchText,
			selectors: { executionStatus, text, exitCode, output, startedAt },
		},
	} = props.script;

	const [shouldShowText, setShowText] = useState(false);
	const [shouldShowOutput, setShowOutput] = useState(false);
	const [shouldAllowInterrupt, setAllowInterrupt] = useState(false);
	const [running, setRunning] = useState(executionStatus === 'running');

	useEffect(() => {
		if (shouldShowText) {
			fetchText();
		}
	}, [shouldShowText]);

	useEffect(() => {
		if (executionStatus === 'running') {
			setRunning(true);
			return;
		}

		if (exitCode === SpecialExitCodes.Aborted) {
			setRunning(false);
			return;
		}

		const timer = setTimeout(() => {
			setRunning(state.executionStatus === 'running');
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [executionStatus, exitCode]);

	useEffect(() => {
		if (!running) {
			setAllowInterrupt(false);
			return;
		}

		if (Date.now() - +startedAt! > 300) {
			setAllowInterrupt(true);
			return;
		}

		const timer = setTimeout(() => {
			if (state.executionStatus === 'running') {
				setAllowInterrupt(true);
			}
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [running]);

	return (
		<div className={cls.scriptDialog.block()}>
			<Button
				icon={<PlusIcon />}
				minimal
				size='small'
				round
				className={cls.scriptDialog.close()}
				onClick={dialog.close}
			/>
			<div className={cls.scriptDialog.name()}>
				<FileTextIcon size={20} />
				{name}
			</div>
			<div>
				<Button
					text='Script Text'
					iconEnd={<ChevronRightIcon />}
					borderless
					stretch
					className={cls.scriptDialog.accordionBtn({
						open: shouldShowText,
					})}
					onClick={() => setShowText((s) => !s)}
				/>
				{shouldShowText && !!text && (
					<pre className={cls.scriptDialog.accordionContent()}>
						{text}
					</pre>
				)}
				{executionStatus !== 'idle' && (
					<>
						<Button
							text={
								<>
									{output.length > 0 && 'Output'}{' '}
									<StatusBadge
										exitCode={exitCode}
										running={running}
									/>
								</>
							}
							iconEnd={output.length > 0 && <ChevronRightIcon />}
							borderless
							stretch
							className={cls.scriptDialog.accordionBtn({
								open: shouldShowOutput,
								output: true,
							})}
							textClassName={cls.scriptDialog.outputBtnText()}
							onClick={() => {
								if (output.length) {
									setShowOutput((s) => !s);
								}
							}}
						/>
						{shouldShowOutput && (
							<Output
								exitCode={exitCode}
								lines={output}
								className={cls.scriptDialog.accordionContent()}
							/>
						)}
					</>
				)}
			</div>
			<div className={cls.scriptDialog.actions()}>
				<Button text='Close' size='large' onClick={dialog.close} />
				{shouldAllowInterrupt ? (
					<Button
						icon={<BanIcon />}
						text='Interrupt'
						fill='red'
						size='large'
						onClick={interruptExecution}
					/>
				) : (
					<Button
						icon={<PlayIcon />}
						text={running ? 'Running...' : 'Run'}
						fill='green'
						size='large'
						onClick={execute}
						disabled={running}
					/>
				)}
			</div>
		</div>
	);
};

type StatusBadgeProps = {
	running: boolean;
	exitCode: number | null;
};

const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
	const { exitCode, running } = props;

	if (!running && exitCode === null) {
		return null;
	}

	const text = (() => {
		if (running) {
			return 'Running...';
		}

		switch (exitCode) {
			case 0:
				return 'Success';
			case SpecialExitCodes.Aborted:
				return 'Interrupted';
			default:
				return 'Fail';
		}
	})();

	return (
		<div
			className={cls.statusBadge.block({
				fail: !!exitCode,
				running,
				success: exitCode === 0,
			})}
		>
			{text}
		</div>
	);
};
