import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Section } from '@/components/Section';
import type { ScriptStore } from '@/views/Scripts/stores/scriptStore';

import { cls } from './ScriptContent.styles';

type Props = {
	script: ScriptStore;
};

export const ScriptContent: React.FC<Props> = ({ script }) => {
	const {
		selectors: { isEditing, text, modifiedText },
		setModifiedText,
		setEditing,
		saveScriptText,
	} = script;

	useHotkeys('ctrl+s', saveScriptText, {
		enabled: isEditing,
		preventDefault: true,
		enableOnFormTags: true,
	});

	useEffect(
		() => () => {
			if (!script.state.modifiedText) {
				setEditing(false);
			}
		},
		[]
	);

	const onContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
		ev
	) => {
		setModifiedText(ev.target.value);
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
					defaultValue={modifiedText ?? text}
					onChange={onContentChange}
					className={cls.scriptContent.text()}
				/>
			) : (
				<pre
					className={cls.scriptContent.text()}
					onDoubleClick={() => setEditing(true)}
				>
					{text}
				</pre>
			)}
		</Section>
	);
};
