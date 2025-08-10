import { Select } from '@/components/Select';

import { cls } from './Main.styles';

export type MainProps = {
	className?: string;
};

export const Main: React.FC<MainProps> = (props) => {
	const { className } = props;

	return (
		<div className={cls.main.block(null, className)}>
			{/* <History /> */}
			{/* <Scripts /> */}
			<Select
				name='asd'
				options={[
					{ text: 'automation', icon: 'folder-open' },
					{ text: 'monitoring', icon: 'folder-open' },
					{ text: 'utilities', icon: 'folder-open' },
					{ text: 'Create new folder', icon: 'plus', selected: true },
				]}
			/>
		</div>
	);
};
