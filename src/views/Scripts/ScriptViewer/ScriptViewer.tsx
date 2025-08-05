import { CodeXmlIcon } from 'lucide-react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';
import { Output } from '@/views/Scripts/ScriptViewer/Output';
import { ScriptContent } from '@/views/Scripts/ScriptViewer/ScriptContent';
import { useScriptViewerStore } from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './ScriptViewer.styles';

export type ScriptViewerProps = {};

export const ScriptViewer: React.FC<ScriptViewerProps> = (props) => {
	const {} = props;

	return (
		<Section
			header={<Header />}
			className={cls.scriptViewer.block()}
			contentClassName={cls.scriptViewer.content()}
		>
			<ScriptContent />
			<Output />
		</Section>
	);
};

const Header: React.FC = () => {
	const { setEditing, isEditing, saveScript } = useScriptViewerStore();

	return (
		<div className={cls.header.block()}>
			<div className={cls.header.info()}>
				<CodeXmlIcon size={20} className={cls.header.icon()} />
				<span className={cls.header.title()}>backup.sh</span>
				<span className={cls.header.subtitle()}>
					automation/backup.sh
				</span>
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

				<Button icon='play' text='Run' fill='green' />
			</div>
		</div>
	);
};
