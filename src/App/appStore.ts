import { ComponentStore } from '@/utils';

export type View = 'scripts' | 'history' | 'active';

type State = {
	view: View;
};

// TODO: add routing history

class AppStore extends ComponentStore<State> {
	state: State = {
		view: 'scripts',
	};

	setView = (view: State['view']) => {
		this.setState((state) => {
			state.view = view;
		});
	};
}

export const appStore = new AppStore();
