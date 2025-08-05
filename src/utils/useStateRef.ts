import {
	useRef,
	useState,
	type Dispatch,
	type RefObject,
	type SetStateAction,
} from 'react';

type UseStateRef = {
	<S>(
		initialState: S | (() => S)
	): readonly [S, Dispatch<SetStateAction<S>>, Readonly<RefObject<S>>];
	<S = undefined>(): readonly [
		S | undefined,
		Dispatch<SetStateAction<S | undefined>>,
		Readonly<RefObject<S>>,
	];
};

export const useStateRef: UseStateRef = <S>(initialState?: S | (() => S)) => {
	const [state, setState] = useState(initialState);
	const stateRef = useRef(initialState);
	stateRef.current = state;
	return [state, setState, stateRef] as const;
};
