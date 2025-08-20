import { useHotkeys } from 'react-hotkeys-hook';

import { Section } from '@/components/Section';
import { useScriptViewerStore } from '@/views/Scripts/ScriptViewer/scriptViewerStore';
import { useFilesStore } from '@/views/Scripts/filesStore';

import { cls } from './ScriptContent.styles';

export type ScriptContentProps = {};

export const ScriptContent: React.FC<ScriptContentProps> = (props) => {
	const { selectedScript } = useFilesStore();
	const { isEditing, setScriptContent, saveScript, setEditing } =
		useScriptViewerStore();

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
					defaultValue={selectedScript?.text}
					onChange={onContentChange}
					className={cls.scriptContent.text()}
				/>
			) : (
				<pre
					className={cls.scriptContent.text()}
					onDoubleClick={() => setEditing(true)}
				>
					{selectedScript?.text}
				</pre>
			)}
		</Section>
	);
};
