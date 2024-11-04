import { setGridAreaTournament } from "../helpers/setGridArea";
import PlayerComponent from "../components/playerComponent/playerComponent.js";
import gsap from "gsap";
import boxValue from "../helpers/boxValue.js";
import { translation } from "../js/translate.js";
import {createTournamentBracket, getFinalPlayers} from "../js/tournament_logic";

export default class TournamentView {
	name = "TournamentView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = ["src/styles/home.css", "src/styles/tournament.css"];
		this.onHomeTransition = null;
		this.players = [];
		this.tournamentNameValue = null;
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
		const homeContainer = document.createElement('div');
		homeContainer.className = 'home-container';
		mainContainer.appendChild(homeContainer);

		const gridLayout = document.createElement("div");
		gridLayout.className = "tournament-grid-layout";

		homeContainer.appendChild(gridLayout);

		const player1Container = document.createElement("div");
		player1Container.className = "player1";
		const nameContainer = document.createElement("div");
		nameContainer.className = "name";
		const player2Container = document.createElement("div");
		player2Container.className = "player2";
		const player3Container = document.createElement("div");
		player3Container.className = "player3";
		const mapContainer = document.createElement("div");
		mapContainer.className = "map";
		const player4Container = document.createElement("div");
		player4Container.className = "player4";

		gridLayout.appendChild(player1Container);
		gridLayout.appendChild(nameContainer);
		gridLayout.appendChild(player2Container);
		gridLayout.appendChild(player3Container);
		gridLayout.appendChild(mapContainer);
		gridLayout.appendChild(player4Container);

		await this.loadLayout("tournament", setGridAreaTournament, gridLayout);

		mainContainer.removeChild(homeContainer);
	}

	async render(tournamentName) {
		this.tournamentNameValue = tournamentName;
		this.loadCss();

		this.container = document.createElement("div");
		this.container.className = "home-container";
		this.container.id = "home-container";
		
        
		const results = sessionStorage.getItem('results');
		if (results && JSON.parse(results).length === 3) {
			this.viewController.setGridOpacity(0);
			const event = new CustomEvent("removeField");
			window.dispatchEvent(event);
			await this.renderWinner().then(() => {
				sessionStorage.removeItem('tournamentName');
				sessionStorage.removeItem('tournamentData');
				sessionStorage.removeItem('results');
				sessionStorage.removeItem('brackets');
				sessionStorage.removeItem('match');
			});
			return this.container;
		}

		const players = sessionStorage.getItem('tournamentData');
		if (players) {
			this.players = JSON.parse(players);
		}

		gsap.set(this.container, { opacity: 0 });
		gsap.to(this.container, { duration: 0.5, opacity: 1 });

		const gridLayout = document.createElement("div");
		gridLayout.className = "tournament-grid-layout";

		await this.player1(gridLayout);
		this.tournamentName(gridLayout, tournamentName);
		await this.player2(gridLayout);
		await this.player3(gridLayout);
		await this.player4(gridLayout);
		this.map(gridLayout);

		this.container.appendChild(gridLayout);

		return this.container;
	}

	async renderWinner() {
		const tournamentResults = sessionStorage.getItem('results');
		const parseRes = JSON.parse(tournamentResults)[2];

		const resultsContainer = document.createElement("div");
		resultsContainer.className = "results-container";

		const headerContainer = document.createElement("div");
		headerContainer.className = "winner-header-container";
		const header = document.createElement("h2");
		header.textContent = `${translation.winner[this.language]}`;
		header.dataset.translate_inner = "winner";
	
		header.className = "winner-header";
		const trophy = document.createElement("img");
		trophy.className = "trophy-winner";
		trophy.src = "../static/elements/trophy.png";

		headerContainer.appendChild(header);
		headerContainer.appendChild(trophy);

		const players = sessionStorage.getItem('tournamentData');
		const playersData = JSON.parse(players);
		
		const winner = playersData.find((player) => player.alias === parseRes.winner);
		const winnerAvatar = document.createElement("img");
		winnerAvatar.src = `${winner.avatar}`;
		winnerAvatar.className = "winner-avatar";

		const winnerName = document.createElement("span");
		winnerName.textContent = `${parseRes.winner}`;
		winnerName.className = "winner-name";

		resultsContainer.appendChild(headerContainer);
		resultsContainer.appendChild(winnerAvatar);
		resultsContainer.appendChild(winnerName);

		this.container.appendChild(resultsContainer);
	}

	async player1(gridLayout) {
		const player1Container = document.createElement("div");
		player1Container.className = "player1 tournament-container";
		player1Container.id = "player1";

		const header = document.createElement("h2");
		header.textContent = `${translation.player1[this.language]}`;
		header.dataset.translate_inner = "player1";

		player1Container.appendChild(header);

		const playerComponent = await new PlayerComponent(this.players, 0).render();
		player1Container.appendChild(playerComponent);

		gridLayout.appendChild(player1Container);
		setGridAreaTournament(player1Container);
	}

	tournamentName(gridLayout, tournamentName) {
		const tournamentNameContainer = document.createElement("div");
		tournamentNameContainer.className = "name tournament-container";
		tournamentNameContainer.id = "tournament-name";

		const headerContainer = document.createElement("div");
		headerContainer.className = "tournament-header-container";
		tournamentNameContainer.appendChild(headerContainer);

		const header = document.createElement("h2");
		header.textContent = `${tournamentName}`;
		headerContainer.appendChild(header);

		const trophy = document.createElement("img");
		trophy.src = "../static/elements/trophy.png";
		trophy.className = "trophy";
		headerContainer.appendChild(trophy);

		gridLayout.appendChild(tournamentNameContainer);
		setGridAreaTournament(tournamentNameContainer);
	}

	async player2(gridLayout) {
		const player2Container = document.createElement("div");
		player2Container.className = "player2 tournament-container";
		player2Container.id = "player2";

		const header = document.createElement("h2");
		header.textContent = `${translation.player2[this.language]}`;
		header.dataset.translate_inner = "player2";

		player2Container.appendChild(header);

		const playerComponent = await new PlayerComponent(this.players, 1).render();
		player2Container.appendChild(playerComponent);

		gridLayout.appendChild(player2Container);
		setGridAreaTournament(player2Container);
	}

	async player3(gridLayout) {
		const player3Container = document.createElement("div");
		player3Container.className = "player3 tournament-container";
		player3Container.id = "player3";

		const header = document.createElement("h2");
		header.textContent = `${translation.player3[this.language]}`;
		header.dataset.translate_inner = "player3";
		player3Container.appendChild(header);

		const playerComponent = await new PlayerComponent(this.players, 2).render();
		player3Container.appendChild(playerComponent);

		gridLayout.appendChild(player3Container);
		setGridAreaTournament(player3Container);
	}

	async player4(gridLayout) {
		const player4Container = document.createElement("div");
		player4Container.className = "player4 tournament-container";
		player4Container.id = "player4";

		const header = document.createElement("h2");
		header.textContent = `${translation.player4[this.language]}`;
		header.dataset.translate_inner = "player4";
		player4Container.appendChild(header);

		const playerComponent = await new PlayerComponent(this.players, 3).render();
		player4Container.appendChild(playerComponent);

		gridLayout.appendChild(player4Container);
		setGridAreaTournament(player4Container);
	}

	map(gridLayout) {
		const mapContainer = document.createElement("div");
		mapContainer.className = "map tournament-container";
		mapContainer.id = "map";

		const mapContent = document.createElement("div");
		mapContent.className = "map-content";
		mapContainer.appendChild(mapContent);

		const header = document.createElement("h2");
		header.textContent = "Map";
		mapContent.appendChild(header);

		const playButton = document.createElement("button");
		playButton.textContent = `${translation.play[this.language]}`;
		playButton.dataset.translate_inner = "play";
		playButton.className = "play-button";
		mapContent.appendChild(playButton);

		setTimeout(() => {
			let readyButtons = document.querySelectorAll(".player-button");

			readyButtons.forEach((readyButton) => {
				readyButton.addEventListener("click", () => {
					if (readyButton.style.color === "green") {
						readyButton.disabled = true;
					}

					let allClicked = Array.from(readyButtons).every((button) => button.disabled === true);

					if (allClicked) {
						playButton.style.backgroundColor = "green";
						sessionStorage.setItem("tournamentData", JSON.stringify(this.players));
						sessionStorage.setItem("tournamentName", this.tournamentNameValue);
						if (sessionStorage.getItem('tournamentData')) {
							if (!sessionStorage.getItem('results')) {
								sessionStorage.setItem('results', JSON.stringify([]));
							}
							const tournamentData = JSON.parse(sessionStorage.getItem('tournamentData'));
							if (!sessionStorage.getItem('brackets')) {
								const brackets = createTournamentBracket(tournamentData);
								sessionStorage.setItem('brackets', JSON.stringify(brackets));
							}
							const results = JSON.parse(sessionStorage.getItem('results'));
							let match = null;
							const semiFinals = JSON.parse(sessionStorage.getItem('brackets'));
							if (!results.some(result => result.stage === 'semiFinal1')) {
								match = semiFinals[0];
							} else if (!results.some(result => result.stage === 'semiFinal2')) {
								match = semiFinals[1];
							} else if (!results.some(result => result.stage === 'final')) {
								match = getFinalPlayers(results, tournamentData);
							}
							if (match) {
								sessionStorage.setItem('match', JSON.stringify(match));
							}
							this.displayOrder(semiFinals, results, match);
						}
						playButton.addEventListener("click", () => {
							this.state.setStateNotify({ currentView: "/game-tournament" });
							this.players = [];
						});
					}
				});
			});
		}, 1000);

		gridLayout.appendChild(mapContainer);
		setGridAreaTournament(mapContainer);
	}

	async displayOrder(semiFinals, results, match) {
		const rootDiv = document.getElementById("app");

		const container = document.createElement('div');
		container.className = 'brackets-container';
		rootDiv.appendChild(container);

		const matchContainer = document.createElement('div');
		matchContainer.className = 'match-container';
		container.appendChild(matchContainer);

		const header = document.createElement('h2');
		matchContainer.appendChild(header);
		let firstMatch;
		let secondMatch;

		if (!results.some(result => result.stage === 'semiFinal1')) {
			header.textContent = 'Semi Final 1';
			firstMatch = this.createMatch(semiFinals[0].player1, semiFinals[0].player2);
			secondMatch = this.createMatch(semiFinals[1].player1, semiFinals[1].player2);
			matchContainer.appendChild(firstMatch);
			matchContainer.appendChild(secondMatch);
		} else if (!results.some(result => result.stage === 'semiFinal2')) {
			header.textContent = 'Semi Final 2';
			firstMatch = this.createMatch(semiFinals[0].player1, semiFinals[0].player2);
			secondMatch = this.createMatch(semiFinals[1].player1, semiFinals[1].player2);
			matchContainer.appendChild(firstMatch);
			matchContainer.appendChild(secondMatch);
		} else if (!results.some(result => result.stage === 'final')) {
			header.textContent = 'Final';
			const final = this.createMatch(match.player1, match.player2);
			matchContainer.appendChild(final);
		}
		
		setTimeout( () => {
			container.remove();
		}, 3000);
	}

	createMatch(player1, player2) {
		const match = document.createElement('div');
		match.className = 'match';

		const matchPlayer1Container = document.createElement('div');
		matchPlayer1Container.className = 'match-player-container';
		match.appendChild(matchPlayer1Container);

		const matchPlayer1 = document.createElement('span');
		matchPlayer1.className = 'player';
		matchPlayer1.textContent = player1.alias;
		matchPlayer1Container.appendChild(matchPlayer1);

		const matchPlayer1Avatar = document.createElement('img');
		matchPlayer1Avatar.src = player1.avatar;
		matchPlayer1Avatar.className = 'match-avatar';
		matchPlayer1Container.appendChild(matchPlayer1Avatar);

		const matchVersus = document.createElement('img');
		matchVersus.src = '../static/elements/flash.png';
		matchVersus.className = 'match-versus';
		match.appendChild(matchVersus);

		const matchPlayer2Container = document.createElement('div');
		matchPlayer2Container.className = 'match-player-container';
		match.appendChild(matchPlayer2Container);


		const matchPlayer2 = document.createElement('span');
		matchPlayer2.className = 'player';
		matchPlayer2.textContent = player2.alias;
		matchPlayer2Container.appendChild(matchPlayer2);
		
		const matchPlayer2Avatar = document.createElement('img');
		matchPlayer2Avatar.src = player2.avatar;
		matchPlayer2Avatar.className = 'match-avatar';
		matchPlayer2Container.appendChild(matchPlayer2Avatar);

		return match;
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}
}
