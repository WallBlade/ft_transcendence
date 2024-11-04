import { setGridAreaProfile } from "../helpers/setGridArea.js";
import ProfileComponent from "../components/profileComponent/profileComponent.js";
import achievementsPreview from "../components/achievementsPreview/achievementsPreview.js";
import gsap from "gsap";
import friendsComponent from "../components/friendsComponent/friendsComponent.js";
import enumProfileView from "../helpers/enumProfileView.js";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import boxValue from "../helpers/boxValue.js";
import { translation } from "../js/translate.js";

export default class ProfileView {
	name = "ProfileView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = ["src/styles/home.css", "src/styles/profile.css"];
		this.container = null;
		this.profileData = null;
		this.gamesData = null;
		this.friendsData = null;
		this.friendRequestStatus = null;
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
					setGridAreaFunction(box);
					boxValue[layoutName][box.classList[0]] = box.getBoundingClientRect();
				});

				resolve();
			});
		});
	}

	async preload(mainContainer) {
		const homeContainer = document.createElement("div");
		homeContainer.className = "home-container";
		mainContainer.appendChild(homeContainer);

		const gridLayout = document.createElement("div");
		gridLayout.className = "profile-grid-layout";

		homeContainer.appendChild(gridLayout);

		const profileContainer = document.createElement("div");
		profileContainer.className = "profile";
		const historyContainer = document.createElement("div");
		historyContainer.className = "history";
		const achievementsContainer = document.createElement("div");
		achievementsContainer.className = "achievements";
		const friendsContainer = document.createElement("div");
		friendsContainer.className = "friends";

		gridLayout.appendChild(profileContainer);
		gridLayout.appendChild(historyContainer);
		gridLayout.appendChild(achievementsContainer);
		gridLayout.appendChild(friendsContainer);

		await this.loadLayout("profile", setGridAreaProfile, gridLayout);

		mainContainer.removeChild(homeContainer);
	}

	async render(username = null) {
		this.loadCss();

		await this.fetchUserData(username);

        this.container = document.createElement('div');
        this.container.className = 'home-container';
		this.container.id = 'home-container';

		gsap.set(this.container, { opacity: 0 });
		gsap.to(this.container, { duration: 0.5, opacity: 1 });

		const gridLayout = document.createElement("div");
		gridLayout.className = "profile-grid-layout";

		this.profile(gridLayout, username);
		this.history(gridLayout);
		this.achievements(gridLayout);
		this.friends(gridLayout, username);

		this.container.appendChild(gridLayout);

		return this.container;
	}

	profile(gridLayout, username) {
		let profile;
		if (username) {
			profile = new ProfileComponent(this.profileData.user, this.viewController, enumProfileView.PUBLIC_PROFILE, this.state).render();
		} else {
			profile = new ProfileComponent(this.profileData.user, this.viewController, enumProfileView.PRIVATE_PROFILE, this.state).render();
		}

		gridLayout.appendChild(profile);
		setGridAreaProfile(profile);
	}

	history(gridLayout) {
		const history = document.createElement("div");
		history.className = "history";

		const historyContainer = document.createElement("div");
		historyContainer.className = "history-container";

		const headerContainer = document.createElement("div");
		headerContainer.className = "history-header-container";
		const header = document.createElement("h2");
		header.innerHTML = `${translation.history[this.language]}`;
		header.dataset.translate_inner = "history";

		const arrow = document.createElement("img");
		arrow.src = "../../static/elements/nav_arrow.png";
		arrow.className = "arrow-history";

		headerContainer.appendChild(header);
		headerContainer.appendChild(arrow);

		historyContainer.appendChild(headerContainer);

		const listGameContainer = document.createElement("div");
		listGameContainer.className = "list-game-container";

		for (let item of this.gamesData) {
			const game = document.createElement("div");
			game.className = "game";

			const date = document.createElement("span");
			date.className = "date";
			const dateObj = this.formatDate(item.start_time);
			date.innerHTML = dateObj;
			game.appendChild(date);

			const playerContainer = document.createElement("div");
			playerContainer.className = "history-player-container";

			const winIndicator = document.createElement("span");
			winIndicator.className = "indicator-win";
			winIndicator.innerHTML = "&#11165";

			const loseIndicator = document.createElement("span");
			loseIndicator.className = "indicator-lose";
			loseIndicator.innerHTML = "&#11167";

			this.profileData.user.username === item.winner ? playerContainer.appendChild(winIndicator) : playerContainer.appendChild(loseIndicator);

			const player1 = document.createElement("span");
			player1.className = "player";
			player1.innerHTML = item.player1_id;

			playerContainer.appendChild(player1);

			const scoreSeparator = document.createElement("img");
			scoreSeparator.src = "../../static/elements/flash.png";
			scoreSeparator.className = "score-separator";

			playerContainer.appendChild(scoreSeparator);

			const player2 = document.createElement("span");
			player2.className = "player";
			player2.innerHTML = item.player2_id;

			playerContainer.appendChild(player2);

			game.appendChild(playerContainer);

			const scoreContainer = document.createElement("span");
			scoreContainer.innerHTML = `${item.score_player1}:${item.score_player2}`;

			game.appendChild(scoreContainer);
			listGameContainer.appendChild(game);
		}

		window.requestAnimationFrame(() => {
			if (listGameContainer.scrollHeight > listGameContainer.clientHeight) {
				listGameContainer.classList.add("overflowing");
			}
		});

		historyContainer.appendChild(listGameContainer);
		history.appendChild(historyContainer);
		gridLayout.appendChild(history);
		setGridAreaProfile(history);
	}

	achievements(gridLayout) {
		const achievements = new achievementsPreview(this.viewController, this.profileData.badges);

		gridLayout.appendChild(achievements.render());
		setGridAreaProfile(achievements.render());
	}

	async friends(gridLayout, username) {
		const friends = new friendsComponent(this.friendsData, this.profileData.user.username, this.viewController, false, this.state);

		const friendsContent = friends.render()[0];
		const friendsOpen = friends.render()[1];
		friendsOpen.style.display = "flex";
		friendsContent.appendChild(friendsOpen);

		if (username) {
			friendsOpen.style.gridRow = "1 / 4";
			friendsOpen.style.paddingTop = "2cqi";
			gridLayout.appendChild(friendsOpen);
			setGridAreaProfile(friendsOpen);
		} else {
			gridLayout.appendChild(friendsContent);
			setGridAreaProfile(friendsContent);
		}
	}

	formatDate(date) {
		const dateObj = new Date(date);
		const month = dateObj.getUTCMonth() + 1; // Months are 0-11, add 1 to get 1-12
		const day = dateObj.getUTCDate();
		const hours = dateObj.getUTCHours() + 1;
		const minutes = dateObj.getUTCMinutes();

		// Pad the month, day, hours and minutes with 0 if they're less than 10
		const paddedMonth = month < 10 ? "0" + month : month;
		const paddedDay = day < 10 ? "0" + day : day;
		const paddedHours = hours < 10 ? "0" + hours : hours;
		const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;

		return `${paddedDay}/${paddedMonth}-${paddedHours}:${paddedMinutes}`;
	}

	async fetchUserData(username) {
		let apiPath;
		if (username) {
			apiPath = `https://${ip_address}:8000/api/profile/${username}/`;
		} else {
			apiPath = `https://${ip_address}:8000/api/profile/`;
		}
		try {
			const response = await fetch(apiPath, {
				method: "GET",
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok === true) {
				this.profileData = data;
				this.gamesData = data.games;
				this.friendsData = data.friends;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}
}
