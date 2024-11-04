import gsap from "gsap";
import leaderboardPreview from "../components/leaderboardPreview/leaderboardPreview.js";
import tournamentPreview from "../components/tournamentPreview/tournamentPreview.js";
import friendsComponent from "../components/friendsComponent/friendsComponent.js";
import notificationsComponent from "../components/notificationsComponent/notificationsComponent.js";
import achievementsPreview from "../components/achievementsPreview/achievementsPreview.js";
import profileComponent from "../components/profileComponent/profileComponent.js";
import enumProfileView from "../helpers/enumProfileView.js";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import { setGridAreaHome } from "../helpers/setGridArea.js";
import boxValue from "../helpers/boxValue.js";

import { translation } from "../js/translate.js";

export default class HomeView {
	name = "HomeView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = ["src/styles/home.css", "src/styles/notifications.css", "src/styles/friends.css", "src/styles/leaderboard.css", "src/styles/selectmap.css", "src/styles/profile.css"];
		this.container = null;
		this.isFriendsOpen = false;
		this.profileData = null;
		this.leaderboardData = null;

		this.state = state;
	}

	loadCss() {
		return new Promise((resolve, reject) => {
			this.cssPath.forEach((path) => {
				if (!document.querySelector(`link[href="${path}"]`)) {
					const cssLink = document.createElement("link");
					cssLink.href = path;
					cssLink.rel = "stylesheet";
					cssLink.type = "text/css";
					cssLink.onload = resolve;
					cssLink.onerror = reject;
					document.head.appendChild(cssLink);
				} else {
					resolve();
				}
			});
		});
	}

	async loadLayout(layoutName, setGridAreaFunction, gridLayout) {
		return await new Promise((resolve) => {
			// Force a reflow
			void gridLayout.offsetHeight;

			requestAnimationFrame(() => {
				let boxes = gridLayout.querySelectorAll("div");
				boxes.forEach((box) => {
					if (box.classList[0] === "friends-open" || box.classList[0] === "notifications-open") {
						box.style.display = "flex";
					}
					setGridAreaFunction(box);
					boxValue[layoutName][box.classList[0]] = box.getBoundingClientRect();
				});

				resolve();
			});
		});
	}

	async preloadViews() {
		await this.loadCss();

		const appContainer = document.getElementById("app");
		const homeLayerContainer = document.createElement("div");
		homeLayerContainer.className = "home-layer-container";
		appContainer.appendChild(homeLayerContainer);
		const mainContainer = document.createElement("div");
		mainContainer.className = "main-container";
		homeLayerContainer.appendChild(mainContainer);
		const homeContainer = document.createElement("div");
		homeContainer.className = "home-container";
		mainContainer.appendChild(homeContainer);
		await this.preloadHome(homeContainer);

		appContainer.removeChild(homeLayerContainer);

		const event = new CustomEvent("preloadComplete");
		window.dispatchEvent(event);
	}

	async preload(mainContainer) {
		const homeContainer = document.createElement("div");
		homeContainer.className = "home-container";
		mainContainer.appendChild(homeContainer);

		const gridLayout = document.createElement("div");
		gridLayout.className = "home-grid-layout";

		homeContainer.appendChild(gridLayout);

		const leaderboard = document.createElement("div");
		leaderboard.className = "leaderboard";
		const selecMap = document.createElement("div");
		selecMap.className = "selectmap";
		const tournament = document.createElement("div");
		tournament.className = "tournament";
		const friendsClose = document.createElement("div");
		friendsClose.className = "friends";
		const friendsOpen = document.createElement("div");
		friendsOpen.className = "friends-open";
		const notificationsClose = document.createElement("div");
		notificationsClose.className = "notifications";
		const notificationsOpen = document.createElement("div");
		notificationsOpen.className = "notifications-open";
		const profile = document.createElement("div");
		profile.className = "profile";
		const achievements = document.createElement("div");
		achievements.className = "achievements";

		gridLayout.appendChild(leaderboard);
		gridLayout.appendChild(selecMap);
		gridLayout.appendChild(tournament);
		gridLayout.appendChild(friendsClose);
		gridLayout.appendChild(friendsOpen);
		gridLayout.appendChild(notificationsClose);
		gridLayout.appendChild(notificationsOpen);
		gridLayout.appendChild(profile);
		gridLayout.appendChild(achievements);

		await this.loadLayout("home", setGridAreaHome, gridLayout);

		mainContainer.removeChild(homeContainer);
	}

	async render() {
		await this.loadCss();
		await this.fetchUserData();
		await this.fetchLeaderboardData();

		this.container = document.createElement("div");
		this.container.className = "home-container";
		this.container.id = "home-container";

		gsap.set(this.container, { opacity: 0 });
		gsap.to(this.container, { duration: 0.5, opacity: 1 });

		const gridLayout = document.createElement("div");
		gridLayout.className = "home-grid-layout";

		this.leaderboard(gridLayout);
		this.selectMap(gridLayout);
		this.tournament(gridLayout);
		this.friends(gridLayout);
		await this.notifications(gridLayout);
		this.profile(gridLayout);
		this.achievements(gridLayout);

		this.container.appendChild(gridLayout);
		return this.container;
	}

	leaderboard(gridLayout) {
		const preview = new leaderboardPreview(this.leaderboardData[0], this.viewController, this.profileData.user.username, this.state);

		gridLayout.appendChild(preview.render());
	}

	selectMap(gridLayout) {
		const selectMap = document.createElement("div");
		selectMap.className = "selectmap";
		const header = document.createElement("h2");
		header.textContent = `${translation.play[this.language]}`;
		header.dataset.translate_inner = "play";
		selectMap.appendChild(header);
		gridLayout.appendChild(selectMap);

		selectMap.addEventListener("click", () => {
			this.viewController.transitionToSelectMap();
			const event = new CustomEvent("selectMap");
			window.dispatchEvent(event);
		});
	}

	tournament(gridLayout) {
		const preview = new tournamentPreview(this.viewController, this.state);

		gridLayout.appendChild(preview.render());
	}

	friends(gridLayout) {
		const friends = new friendsComponent(this.profileData.friends, this.profileData.user.username, this.viewController, true, this.state);

		gridLayout.appendChild(friends.render()[0]);
		gridLayout.appendChild(friends.render()[1]);
	}

	async notifications(gridLayout) {
		const notifications = new notificationsComponent(this.viewController, this.state, this.profileData.user.username);
		notifications.loadCss();

		this.state.setState({ notifications: notifications });

		gridLayout.appendChild(await notifications.notifications());
	}

	profile(gridLayout) {
		const profile = new profileComponent(this.profileData.user, this.viewController, enumProfileView.HOME_PROFILE, this.state);

		gridLayout.appendChild(profile.render());
	}

	achievements(gridLayout) {
		const achievements = new achievementsPreview(this.viewController, this.profileData.badges);

		gridLayout.appendChild(achievements.render());
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}

	getIsFriendsOpen() {
		return this.isFriendsOpen;
	}

	async fetchUserData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/profile/`, {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			if (response.ok === true) {
				this.profileData = data;
				this.state.setState({username: data.user.username});
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async fetchLeaderboardData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/leaderboard`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (response.ok === true) {
				this.leaderboardData = data.leaderboard;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}
}
