import { ComponentStore } from '@/utils';

type State = {
	view: 'scripts' | 'history' | 'active';
};

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

export const appStore = AppStore.init();
