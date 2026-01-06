import { ComponentStore } from '@/utils';

export type View = 'scripts' | 'history' | 'active';

type State = {
	view: View;
};

class AppStore extends ComponentStore<State> {
	state: State = {
		view: 'scripts',
	};

	constructor() {
		super();

		if (history.state) {
			this.state.view = history.state;
		} else {
			history.replaceState(this.state.view, '');
		}

		window.addEventListener('popstate', (e) => {
			this.setState((state) => {
				state.view = e.state;
			});
		});
	}

	setView = (view: State['view']) => {
		if (view === this.state.view) {
			return;
		}

		this.setState((state) => {
			state.view = view;
		});

		history.pushState(view, '');
	};
}

export const appStore = new AppStore();
