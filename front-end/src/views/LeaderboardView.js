import { setGridAreaLeaderboard } from "../helpers/setGridArea.js";
import ViewController from "./HomeViewController.js";
import gsap from "gsap";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import boxValue from "../helpers/boxValue.js";
import { translation } from "../js/translate.js";

export default class LeaderboardView {
	name = "LeaderboardView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = ["src/styles/home.css", "src/styles/leaderboard.css"];
		this.container = null;
		this.onHomeTransition = null;
		this.leaderboard = null;
		this.state = state;
	}

	loadCss() {
		if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
			const cssLink = document.createElement("link");
			cssLink.href = this.cssPath[0];
			cssLink.href = this.cssPath[1];
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";
			document.head.appendChild(cssLink);
		}
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
		gridLayout.className = "leaderboard-grid-layout";

		homeContainer.appendChild(gridLayout);

		const firstPlaceContainer = document.createElement("div");
		firstPlaceContainer.className = "first";
		const secondPlaceContainer = document.createElement("div");
		secondPlaceContainer.className = "second";
		const thirdPlaceContainer = document.createElement("div");
		thirdPlaceContainer.className = "third";
		const listPlaceContainer = document.createElement("div");
		listPlaceContainer.className = "list";

		gridLayout.appendChild(firstPlaceContainer);
		gridLayout.appendChild(secondPlaceContainer);
		gridLayout.appendChild(thirdPlaceContainer);
		gridLayout.appendChild(listPlaceContainer);

		await this.loadLayout("leaderboard", setGridAreaLeaderboard, gridLayout);

		mainContainer.removeChild(homeContainer);
	}

	async render(username = null) {
		this.username = username;
		this.loadCss();
		await this.initData();

		this.container = document.createElement("div");
		this.container.className = "home-container";
		this.container.id = "home-container";

		gsap.set(this.container, { duration: 0.5, opacity: 0 });
		gsap.to(this.container, { duration: 0.5, opacity: 1 });

		const gridLayout = document.createElement("div");
		gridLayout.className = "leaderboard-grid-layout";

		this.firstPlace(gridLayout);
		this.secondPlace(gridLayout);
		this.thirdPlace(gridLayout);
		this.listPlace(gridLayout);

		this.container.appendChild(gridLayout);

		return this.container;
	}

	firstPlace(gridLayout) {
		const firstPlaceContainer = document.createElement("div");
		firstPlaceContainer.className = "first container";

		const firstPlaceContent = document.createElement("div");
		firstPlaceContent.className = "first-content";
		firstPlaceContainer.appendChild(firstPlaceContent);

		const highlight = document.createElement("img");
		highlight.src = "../../static/elements/highlight.png";
		highlight.className = "highlight-first";
		firstPlaceContainer.appendChild(highlight);

		let playerData = this.leaderboard[0];
		if (!playerData) {
			playerData = {
				score: -42,
				win_rate: 0,
				username: "?",
				profile_picture: "profile_pictures/casper.png",
			};
		}
		const dataContainer = document.createElement("div");
		dataContainer.className = "first-data-container";
		firstPlaceContent.appendChild(dataContainer);

		const header = document.createElement("h2");
		header.textContent = "#TOP1";
		dataContainer.appendChild(header);

		const infos = document.createElement("div");
		infos.className = "infos";
		dataContainer.appendChild(infos);

		const scoreContainer = document.createElement("div");
		scoreContainer.className = "score-container";
		infos.appendChild(scoreContainer);

		const score = document.createElement("span");
		score.textContent = playerData.score;
		scoreContainer.appendChild(score);

		const trophy = document.createElement("img");
		trophy.src = "../../static/elements/trophy.png";
		trophy.className = "trophy";
		scoreContainer.appendChild(trophy);

		const winrate = document.createElement("span");
		winrate.className = "winrate";
		winrate.textContent = `Winrate : ${playerData.win_rate}%`;
		infos.appendChild(winrate);

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "first-buttons-container";
		infos.appendChild(buttonsContainer);

		const inspectButton = document.createElement("button");
		if (playerData.username === "?")
			inspectButton.disabled = true;
		inspectButton.className = "classic-button";
		buttonsContainer.appendChild(inspectButton);

		const inspectText = document.createElement("span");
		inspectText.textContent = `${translation.viewProfile[this.language]}`;
		inspectText.dataset.translate_inner = "viewProfile";
		inspectText.className = "classic  first-text";
		inspectButton.appendChild(inspectText);

		inspectButton.addEventListener("click", async () => {
			await this.viewController.transitionLeaderboardToProfile(true, this.username === playerData.username ? null : playerData.username);
		});

		const inspectIcon = document.createElement("img");
		inspectIcon.src = "../../static/elements/lens.png";
		inspectIcon.className = "inspect-icon";
		inspectButton.appendChild(inspectIcon);

		const challengeButton = document.createElement("button");
		if (playerData.username === "?")
			challengeButton.disabled = true;
		challengeButton.className = "classic-button";
		buttonsContainer.appendChild(challengeButton);

		const challengeText = document.createElement("span");
		challengeText.textContent = `${translation.challenge[this.language]}`;
		challengeText.dataset.translate_inner = "challenge";
		challengeText.className = "classic first-text";
		challengeButton.appendChild(challengeText);

		challengeButton.addEventListener("click", async () => {
			this.challengeUser(playerData.username);
		});

		const challengeIcon = document.createElement("img");
		challengeIcon.src = "../../static/elements/flash.png";
		challengeIcon.className = "challenge-icon";
		challengeButton.appendChild(challengeIcon);

		const displayWrapper = document.createElement("div");
		displayWrapper.className = "first-display-wrapper";
		firstPlaceContent.appendChild(displayWrapper);

		const displayContainer = document.createElement("div");
		displayContainer.className = "first-display-container";
		displayWrapper.appendChild(displayContainer);

		const flame = document.createElement("img");
		flame.src = "../../static/elements/flame.gif";
		flame.className = "first-flame";
		displayContainer.appendChild(flame);

		const avatar = document.createElement("img");
		avatar.src = `https://${ip_address}:8000/media/${playerData.profile_picture}`;
		avatar.className = "leaderboard-avatar";
		displayContainer.appendChild(avatar);

		const username = document.createElement("span");
		username.textContent = playerData.username;
		username.className = "username";
		displayContainer.appendChild(username);

		gridLayout.appendChild(firstPlaceContainer);
		setGridAreaLeaderboard(firstPlaceContainer);
	}

	secondPlace(gridLayout) {
		const secondPlaceContainer = document.createElement("div");
		secondPlaceContainer.className = "second container";

		const highlight = document.createElement("img");
		highlight.src = "../../static/elements/midlight.png";
		highlight.className = "highlight-other";
		secondPlaceContainer.appendChild(highlight);

		const header = document.createElement("h2");
		header.textContent = "#TOP2";
		secondPlaceContainer.appendChild(header);

		let playerData = this.leaderboard[1];
		if (!playerData) {
			playerData = {
				score: -42,
				win_rate: 0,
				username: "?",
				profile_picture: "profile_pictures/casper.png",
			};
		}
		const dataContainer = document.createElement("div");
		dataContainer.className = "other-data-container";
		secondPlaceContainer.appendChild(dataContainer);

		const infos = document.createElement("div");
		infos.className = "other-infos";
		dataContainer.appendChild(infos);

		const scoreContainer = document.createElement("div");
		scoreContainer.className = "score-container";
		infos.appendChild(scoreContainer);

		const score = document.createElement("span");
		score.textContent = playerData.score;
		scoreContainer.appendChild(score);

		const trophy = document.createElement("img");
		trophy.src = "../../static/elements/trophy.png";
		trophy.className = "trophy";
		scoreContainer.appendChild(trophy);

		const winrate = document.createElement("span");
		winrate.className = "other-winrate";
		winrate.textContent = `Winrate : ${playerData.win_rate}%`;
		infos.appendChild(winrate);

		const inspectButton = document.createElement("button");
		if (playerData.username === "?")
			inspectButton.disabled = true;
		inspectButton.className = "classic-button";
		infos.appendChild(inspectButton);

		const inspectText = document.createElement("span");
		inspectText.textContent = `${translation.viewProfile[this.language]}`;
		inspectText.dataset.translate_inner = "viewProfile";
		inspectText.className = "classic other-text";
		inspectButton.appendChild(inspectText);

		const inspectIcon = document.createElement("img");
		inspectIcon.src = "../../static/elements/lens.png";
		inspectIcon.className = "inspect-icon";
		inspectButton.appendChild(inspectIcon);

		inspectButton.addEventListener("click", async () => {
			await this.viewController.transitionLeaderboardToProfile(true, this.username === playerData.username ? null : playerData.username);
		});

		const displayContainer = document.createElement("div");
		displayContainer.className = "other-display-container";
		dataContainer.appendChild(displayContainer);

		const avatar = document.createElement("img");
		avatar.src = `https://${ip_address}:8000/media/${playerData.profile_picture}`;
		avatar.className = "other-leaderboard-avatar";
		displayContainer.appendChild(avatar);

		const username = document.createElement("span");
		username.textContent = playerData.username;
		username.className = "other-username";
		displayContainer.appendChild(username);

		const challengeButton = document.createElement("button");
		if (playerData.username === "?")
			challengeButton.disabled = true;
		challengeButton.className = "classic-button";
		displayContainer.appendChild(challengeButton);

		challengeButton.addEventListener("click", async () => {
			this.challengeUser(playerData.username);
		});

		const challengeText = document.createElement("span");
		challengeText.textContent = `${translation.challenge[this.language]}`;
		challengeText.dataset.translate_inner = "challenge";
		challengeText.className = "classic other-text";
		challengeButton.appendChild(challengeText);

		const challengeIcon = document.createElement("img");
		challengeIcon.src = "../../static/elements/flash.png";
		challengeIcon.className = "challenge-icon";
		challengeButton.appendChild(challengeIcon);

		gridLayout.appendChild(secondPlaceContainer);
		setGridAreaLeaderboard(secondPlaceContainer);
	}

	thirdPlace(gridLayout) {
		const thirdPlaceContainer = document.createElement("div");
		thirdPlaceContainer.className = "third container";

		const highlight = document.createElement("img");
		highlight.src = "../../static/elements/lowlight.png";
		highlight.className = "highlight-other";
		thirdPlaceContainer.appendChild(highlight);

		const header = document.createElement("h2");
		header.textContent = "#TOP3";
		thirdPlaceContainer.appendChild(header);

		let playerData = this.leaderboard[2];
		if (!playerData) {
			playerData = {
				score: -42,
				win_rate: 0,
				username: "?",
				profile_picture: "profile_pictures/casper.png",
			};
		}
		const dataContainer = document.createElement("div");
		dataContainer.className = "other-data-container";
		thirdPlaceContainer.appendChild(dataContainer);

		const infos = document.createElement("div");
		infos.className = "other-infos";
		dataContainer.appendChild(infos);

		const scoreContainer = document.createElement("div");
		scoreContainer.className = "score-container";
		infos.appendChild(scoreContainer);

		const score = document.createElement("span");
		score.textContent = playerData.score;
		scoreContainer.appendChild(score);

		const trophy = document.createElement("img");
		trophy.src = "../../static/elements/trophy.png";
		trophy.className = "trophy";
		scoreContainer.appendChild(trophy);

		const winrate = document.createElement("span");
		winrate.className = "other-winrate";
		winrate.textContent = `Winrate : ${playerData.win_rate}%`;
		infos.appendChild(winrate);

		const inspectButton = document.createElement("button");
		if (playerData.username === "?")
			inspectButton.disabled = true;
		inspectButton.className = "classic-button";
		infos.appendChild(inspectButton);

		const inspectText = document.createElement("span");
		inspectText.textContent = `${translation.viewProfile[this.language]}`;
		inspectText.dataset.translate_inner = "viewProfile";
		inspectText.className = "classic other-text";
		inspectButton.appendChild(inspectText);

		const inspectIcon = document.createElement("img");
		inspectIcon.src = "../../static/elements/lens.png";
		inspectIcon.className = "inspect-icon";
		inspectButton.appendChild(inspectIcon);

		inspectButton.addEventListener("click", async () => {
			await this.viewController.transitionLeaderboardToProfile(true, this.username === playerData.username ? null : playerData.username);
		});

		const displayContainer = document.createElement("div");
		displayContainer.className = "other-display-container";
		dataContainer.appendChild(displayContainer);

		const avatar = document.createElement("img");
		avatar.src = `https://${ip_address}:8000/media/${playerData.profile_picture}`;
		avatar.className = "other-leaderboard-avatar";
		displayContainer.appendChild(avatar);

		const username = document.createElement("span");
		username.textContent = playerData.username;
		username.className = "other-username";
		displayContainer.appendChild(username);

		const challengeButton = document.createElement("button");
		if (playerData.username === "?")
			challengeButton.disabled = true;
		challengeButton.className = "classic-button";
		displayContainer.appendChild(challengeButton);

		challengeButton.addEventListener("click", async () => {
			this.challengeUser(playerData.username);
		});

		const challengeText = document.createElement("span");
		challengeText.textContent = `${translation.challenge[this.language]}`;
		challengeText.dataset.translate_inner = "challenge";
		challengeText.className = "classic other-text";
		challengeButton.appendChild(challengeText);

		const challengeIcon = document.createElement("img");
		challengeIcon.src = "../../static/elements/flash.png";
		challengeIcon.className = "challenge-icon";
		challengeButton.appendChild(challengeIcon);

		gridLayout.appendChild(thirdPlaceContainer);
		setGridAreaLeaderboard(thirdPlaceContainer);
	}

	listPlace(gridLayout) {
		const listContainer = document.createElement("div");
		listContainer.className = "list container";

		const headerContainer = document.createElement("div");
		headerContainer.className = "list-header-container";
		listContainer.appendChild(headerContainer);

		const header = document.createElement("h2");
		header.textContent = "#GLOBAL";
		headerContainer.appendChild(header);

		const arrowDown = document.createElement("img");
		arrowDown.src = "../../static/elements/arrow-down.png";
		arrowDown.className = "arrow-down";
		headerContainer.appendChild(arrowDown);

		const leaderboardKeys = Object.keys(this.leaderboard);
		const startingIndex = 3;

		const dataContainer = document.createElement("div");
		dataContainer.className = "list-data-container";
		if (leaderboardKeys.length > startingIndex) {
			const leaderboardKeysSubset = leaderboardKeys.slice(startingIndex);
			listContainer.appendChild(dataContainer);
			leaderboardKeysSubset.forEach((key) => {
				let playerData = this.leaderboard[key];
				const playerContainer = document.createElement("div");
				playerContainer.className = "player-container";
				dataContainer.appendChild(playerContainer);

				const rank = document.createElement("span");
				key = parseInt(key) + 1;
				rank.textContent = `#${key}`;
				rank.className = "list-rank";
				playerContainer.appendChild(rank);

				const avatar = document.createElement("img");
				avatar.src = `https://${ip_address}:8000/media/${playerData.profile_picture}`;
				avatar.className = "list-avatar";
				playerContainer.appendChild(avatar);

				const username = document.createElement("span");
				username.textContent = playerData.username;
				username.className = "list-username";
				playerContainer.appendChild(username);

				const score = document.createElement("span");
				score.textContent = playerData.score;
				score.className = "list-score";
				playerContainer.appendChild(score);

				const trophy = document.createElement("img");
				trophy.src = "../../static/elements/trophy.png";
				trophy.className = "list-trophy";
				playerContainer.appendChild(trophy);
			});
		}

		window.requestAnimationFrame(() => {
			if (listContainer.scrollHeight > listContainer.clientHeight) {
				listContainer.classList.add("overflowing");
			}
		});

		gridLayout.appendChild(listContainer);
		setGridAreaLeaderboard(listContainer);
	}

	async initData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/leaderboard`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			if (response.ok === true) {
				this.leaderboard = data.leaderboard;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async challengeUser(username) {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/game_invitation/`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					receiver: username,
				}),
			});

			if (!response.ok) {
				response.json().then((errorData) => {
					// console.log("Error:", errorData.message);
				});
			} else {
				response.json().then((successData) => {
					this.state.setState({gameData: {host: this.username, opponent: username}});
					this.state.setStateNotify({currentView: "/waiting-room"})
				});
			}
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}
}
