import { useEffect, useRef } from 'react';

import { useUpdate } from './useUpdate';

type UseBreakpointOptions = {
	disableAutoUpdate?: boolean;
};

export const useBreakpoint = (options?: UseBreakpointOptions) => {
	const { update } = useUpdate();
	const break768Up = useRef(false);

	useEffect(() => {
		const onMatchMedia = ({ matches }: MediaQueryListEvent) => {
			break768Up.current = matches;

			if (!options?.disableAutoUpdate) {
				update();
			}
		};

		const mediaQuery = matchMedia(`(min-width: 768px)`);
		break768Up.current = mediaQuery.matches;

		mediaQuery.addEventListener('change', onMatchMedia);

		return () => {
			mediaQuery.removeEventListener('change', onMatchMedia);
		};
	}, []);

	return {
		desktopScreen: break768Up.current,
		mobileScreen: !break768Up.current,
		desktopScreenRef: break768Up,
	};
};
