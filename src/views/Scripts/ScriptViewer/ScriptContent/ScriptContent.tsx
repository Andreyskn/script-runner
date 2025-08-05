import { useHotkeys } from 'react-hotkeys-hook';

import { Section } from '@/components/Section';
import { useScriptViewerStore } from '@/views/Scripts/ScriptViewer/scriptViewerStore';

import { cls } from './ScriptContent.styles';

const scriptText = `#!/bin/bash
# Deploy script
echo 'Deploying application...'
echo 'Building project...'
echo 'Deployment complete!'`;

export type ScriptContentProps = {};

export const ScriptContent: React.FC<ScriptContentProps> = (props) => {
	const { isEditing, setScriptContent, saveScript } = useScriptViewerStore();

	useHotkeys('ctrl+s', saveScript, {
		enabled: isEditing,
		preventDefault: true,
		enableOnFormTags: true,
	});

	const onContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
		ev
	) => {
		setScriptContent(ev.target.value);
	};

	return (
		<Section
			card
			header='Script Content'
			className={cls.scriptContent.block()}
			headerClassName={cls.scriptContent.header()}
		>
			{isEditing ? (
				<textarea
					autoFocus
					defaultValue={scriptText}
					onChange={onContentChange}
					className={cls.scriptContent.text()}
				/>
			) : (
				<pre
					contentEditable={isEditing}
					className={cls.scriptContent.text()}
				>
					{scriptText}
				</pre>
			)}
		</Section>
	);
};
