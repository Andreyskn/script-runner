import { cls } from './Section.styles';

export type SectionProps = {
	header: React.ReactNode;
	children: React.ReactNode;
	card?: boolean;
	noContentPadding?: boolean;
	className?: string;
	headerClassName?: string;
	contentClassName?: string;
};

// TODO: fix header rerenders

export const Section: React.FC<SectionProps> = (props) => {
	const {
		header,
		className,
		children,
		card,
		contentClassName,
		headerClassName,
		noContentPadding,
	} = props;

	return (
		<div className={cls.section.block({ card }, className)}>
			<div className={cls.section.header(null, headerClassName)}>
				{header}
			</div>
			<div
				className={cls.section.content(
					{ noPadding: noContentPadding },
					contentClassName
				)}
			>
				{children}
			</div>
		</div>
	);
};
