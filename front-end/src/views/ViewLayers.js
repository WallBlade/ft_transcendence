import { setGridAreaHome, setGridAreaLeaderboard, setGridAreaProfile, setGridAreaTournament } from '../helpers/setGridArea.js';
import boxValue from '../helpers/boxValue.js';
import threeHome from '../threeHome.js';
import headerComponent from '../components/headerComponent/headerComponent.js';
import HomeViewController from './HomeViewController.js';
import GridView from './GridView.js';
const ip_address = import.meta.env.VITE_IP_ADDRESS;

export default class ViewLayers {
    constructor(viewController, view, state) {
        this.viewController = null;
		this.profileData = null;
        this.cssPath = 'src/styles/home.css';
        this.container = null;
		this.state = state;
        this.view = view;
        this.viewController = viewController;
    }

    loadCss() {
		return new Promise((resolve, reject) => {
			if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
				const cssLink = document.createElement('link');
				cssLink.href = this.cssPath;
				cssLink.rel = 'stylesheet';
				cssLink.type = 'text/css';
				cssLink.onload = resolve;
				cssLink.onerror = reject;
				document.head.appendChild(cssLink);
			} else {
				resolve();
			}
		});
	}

    async render() {
        const rootDiv = document.getElementById("app");

        await this.loadCss();
		await this.fetchUserData();

        this.container = document.createElement('div');
        this.container.className = 'home-layer-container';

        const threeBackground = document.createElement('div');
        threeBackground.className = 'three-background';
        const canvas = document.createElement('canvas');
        canvas.className = 'webgl';
        threeBackground.appendChild(canvas);
        await threeHome(canvas);

		const mainContainer = document.createElement('div');
		mainContainer.className = 'main-container';
        this.container.appendChild(mainContainer);

		const header = new headerComponent(this.profileData.user, this.viewController, this.state);
		mainContainer.appendChild(await header.render());

        const gridView = new GridView(this.viewController);
		this.viewController.setGridView(gridView);

		setTimeout(() => {
			this.view.preload(mainContainer).then(async () => {
				mainContainer.appendChild(await gridView.render(this.view));
				if (this.view.name === 'TournamentView') {
					const tournamentName = sessionStorage.getItem('tournamentName');
					mainContainer.appendChild(await this.view.render(tournamentName));
				} else {
					mainContainer.appendChild(await this.view.render());
				}
			});
		}, 10)

        rootDiv.appendChild(threeBackground);

        return this.container;
    }

	async fetchUserData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/profile/`, {
				method: 'GET',
				credentials: "include",
			});

			const data = await response.json();

			this.profileData = data;

		} catch (error) {
			console.error(error);
		}
	}
}
