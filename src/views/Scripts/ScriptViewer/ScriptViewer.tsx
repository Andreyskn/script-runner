import { CodeXmlIcon, PenLineIcon, PlayIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { OutputSection } from '@/views/Scripts/ScriptViewer/Output';
import { ScriptContent } from '@/views/Scripts/ScriptViewer/ScriptContent';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { cls } from './ScriptViewer.styles';

export type ScriptViewerProps = {
	script: ScriptStore;
};

export const ScriptViewer: React.FC<ScriptViewerProps> = (props) => {
	const { script } = props;

	return (
		<Section
			key={script.path}
			header={<Header script={script} />}
			className={cls.scriptViewer.block()}
			contentClassName={cls.scriptViewer.content()}
		>
			<ScriptContent script={script} />
			<OutputSection script={script} />
		</Section>
	);
};

type HeaderProps = {
	script: ScriptStore;
};

const Header: React.FC<HeaderProps> = (props) => {
	const { script } = props;

	const {
		name,
		path,
		selectors: { isEditing, executionStatus, modifiedText },
		setEditing,
		saveScriptText,
		execute,
	} = script;

	return (
		<div className={cls.header.block()}>
			<div className={cls.header.info()}>
				<CodeXmlIcon size={20} className={cls.header.icon()} />
				<span className={cls.header.title()}>{name}</span>
				<span className={cls.header.subtitle()}>/{path}</span>
			</div>
			<div className={cls.header.actions()}>
				{isEditing ? (
					<Button
						icon={<PenLineIcon size={16} />}
						text='Save'
						fill='green'
						onClick={saveScriptText}
						disabled={!modifiedText}
					/>
				) : (
					<Button
						icon={<PenLineIcon size={16} />}
						text='Edit'
						onClick={() => setEditing(true)}
					/>
				)}

				{executionStatus === 'running' ? (
					<Button
						icon={<PlayIcon size={16} />}
						text='Running...'
						fill='green'
						disabled
					/>
				) : (
					<Button
						icon={<PlayIcon size={16} />}
						text='Run'
						fill='green'
						onClick={execute}
					/>
				)}
			</div>
		</div>
	);
};
