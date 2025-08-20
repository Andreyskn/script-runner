import { CodeXmlIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { OutputSection } from '@/views/Scripts/ScriptViewer/Output';
import { ScriptContent } from '@/views/Scripts/ScriptViewer/ScriptContent';
import {
	useInitScriptViewerStore,
	useScriptViewerStore,
} from '@/views/Scripts/ScriptViewer/scriptViewerStore';
import type { ScriptData } from '@/views/Scripts/filesStore';

import { cls } from './ScriptViewer.styles';

export type ScriptViewerProps = {
	script: ScriptData;
};

export const ScriptViewer: React.FC<ScriptViewerProps> = (props) => {
	const { script } = props;

	useInitScriptViewerStore(script.path);

	return (
		<Section
			header={<Header script={script} />}
			className={cls.scriptViewer.block()}
			contentClassName={cls.scriptViewer.content()}
		>
			<ScriptContent />
			<OutputSection />
		</Section>
	);
};

type HeaderProps = {
	script: ScriptData;
};

const Header: React.FC<HeaderProps> = (props) => {
	const { script } = props;
	const { setEditing, isEditing, saveScript, runScript, executionStatus } =
		useScriptViewerStore();

	return (
		<div className={cls.header.block()}>
			<div className={cls.header.info()}>
				<CodeXmlIcon size={20} className={cls.header.icon()} />
				<span className={cls.header.title()}>{script.name}</span>
				<span className={cls.header.subtitle()}>{script.path}</span>
			</div>
			<div className={cls.header.actions()}>
				{isEditing ? (
					<Button
						icon='pen-line'
						text='Save'
						fill='green'
						onClick={saveScript}
					/>
				) : (
					<Button
						icon='pen-line'
						text='Edit'
						onClick={() => setEditing(true)}
					/>
				)}

				{executionStatus === 'running' ? (
					<Button
						icon='play'
						text='Running...'
						fill='green'
						disabled
					/>
				) : (
					<Button
						icon='play'
						text='Run'
						fill='green'
						onClick={runScript}
					/>
				)}
			</div>
		</div>
	);
};
