import { useEffect, useRef, useState } from 'react';

import { useUpdate } from './useUpdate';

type UseBreakpointOptions = {
	disableAutoUpdate?: boolean;
};

export const useBreakpoint = (options?: UseBreakpointOptions) => {
	const { update } = useUpdate();
	const break768Up = useRef(false);

	const [mediaQuery] = useState(() => {
		const mediaQuery = matchMedia(`(min-width: 768px)`);
		break768Up.current = mediaQuery.matches;
		return mediaQuery;
	});

	useEffect(() => {
		const onMatchMedia = ({ matches }: MediaQueryListEvent) => {
			break768Up.current = matches;

			if (!options?.disableAutoUpdate) {
				update();
			}
		};

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
