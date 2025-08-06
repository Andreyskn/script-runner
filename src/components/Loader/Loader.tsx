import { LoaderCircleIcon } from 'lucide-react';

import { cls } from './Loader.styles';

export type LoaderProps = {
	size?: number;
	className?: string;
};

export const Loader: React.FC<LoaderProps> = (props) => {
	const { className, size = 18 } = props;

	return (
		<LoaderCircleIcon
			size={size}
			className={cls.loader.block(null, className)}
		/>
	);
};
