import { ComponentStore } from '@/utils';

type State = {
	view: 'scripts' | 'history';
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

const appStore = new AppStore();

export const useAppStore = () => {
	return {
		setView: appStore.setView,

		get view() {
			return appStore.useSelector((state) => state.view);
		},
	} satisfies Partial<AppStore> & Partial<State> & Record<string, any>;
};
