import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Section } from '@/components/Section';

import type { File } from '../../stores/filesStore';
import { cls } from './ScriptContent.styles';

type Props = {
	script: File;
};

export const ScriptContent: React.FC<Props> = ({ script }) => {
	const {
		scriptStore: {
			state,
			selectors: { isEditing, text, modifiedText, serverTextVersion },
			setModifiedText,
			setEditing,
			saveScriptText,
			fetchText,
		},
	} = script;

	useHotkeys('ctrl+s', saveScriptText, {
		enabled: isEditing,
		preventDefault: true,
		enableOnFormTags: true,
	});

	useEffect(() => {
		fetchText();
	}, [serverTextVersion]);

	useEffect(
		() => () => {
			if (!state.modifiedText) {
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
