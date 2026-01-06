import { useBreakpoint } from './useBreakpoint';

export type ResponsiveProps = {
	desktopScreen?: React.ReactNode;
	mobileScreen?: React.ReactNode;
};

export const Responsive: React.FC<ResponsiveProps> = (props) => {
	const { desktopScreen = null, mobileScreen = null } = props;
	const matches = useBreakpoint();

	if (matches.desktopScreen) {
		return desktopScreen;
	}

	return mobileScreen;
};
