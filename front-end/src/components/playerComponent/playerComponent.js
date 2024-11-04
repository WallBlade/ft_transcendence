import AvatarSelectorComponent from "../avatarSelectorComponent/avatarSelectorComponent";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import { translation } from "../../js/translate.js";

export default class PlayerComponent {
	constructor(players, index, state) {
		this.language = localStorage.getItem("language") || "en";
		this.index = index;
		this.players = players;
		this.cssPath = "src/components/playerComponent/playerComponent.css";
	}

	loadCss() {
		if (document.querySelector(`link[href="${this.cssPath}"]`)) {
			return;
		}
		const link = document.createElement("link");
		link.href = this.cssPath;
		link.rel = "stylesheet";
		link.type = "text/css";
		document.head.appendChild(link);
	}

	async render() {
		this.loadCss();

		const container = document.createElement("div");
		container.className = "tournament-player-container";
		container.id = "player-container";

		const avatarSelector = new AvatarSelectorComponent(this.players, this.index);
		container.appendChild(avatarSelector.avatarSelector());

		const playerInfo = document.createElement("div");
		playerInfo.className = "player-info";
		container.appendChild(playerInfo);

		const playerNameInput = document.createElement("input");
		playerNameInput.type = "text";
		playerNameInput.className = "player-name-input";
		this.players.length === 0 ? (playerNameInput.value = "") : (playerNameInput.value = this.players[this.index].alias);
		playerNameInput.placeholder = `${translation.tournamentNameComment[this.language]}`;
		playerNameInput.dataset.translate_placeholder = "tournamentNameComment";
		playerInfo.appendChild(playerNameInput);
		if (this.players.length > 0) {
			playerNameInput.readOnly = true;
		}

		const playerButton = document.createElement("button");
		playerButton.className = "player-button";
		playerButton.textContent = `${translation.ready[this.language]}`;
		playerButton.dataset.translate_inner = "ready";
		playerInfo.appendChild(playerButton);

		playerButton.addEventListener("click", () => {
			const playerName = playerNameInput.value;
			if (playerName.length >= 3 && playerName.length <= 12) {
				console.log(this.players.length);
				if (!this.players.some((player) => player.alias === playerName) || this.players.length >= 4) {
					const player = {
						alias: playerName,
						avatar: `https://${ip_address}:8000/media/profile_pictures/${avatarSelector.getAvatar()}`,
					};
					this.players.push(player);
					playerButton.disabled = true;
					playerButton.style.color = "green";
					playerNameInput.readOnly = true;
				} else {
					playerNameInput.value = "";
					playerNameInput.placeholder = "Name already taken";
					playerNameInput.style.border = "1px solid red";
				}
			} else {
				playerNameInput.placeholder = "Please enter a valid name";
				playerNameInput.style.border = "1px solid red";
			}
		});

		return container;
	}
}
