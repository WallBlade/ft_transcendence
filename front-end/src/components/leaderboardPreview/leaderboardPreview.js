const ip_address = import.meta.env.VITE_IP_ADDRESS;
import { translation } from "../../js/translate.js";

export default class leaderboardPreview {
	constructor(leader, viewController, currentUser, state) {
		this.language = localStorage.getItem("language") || "en";
		this.leader = leader;
		this.currentUser = currentUser;
		this.viewController = viewController;
		this.cssPath = "src/components/leaderboardPreview/leaderboardPreview.css";
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

	render() {
		this.loadCss();

		const container = document.createElement("div");
		container.className = "leaderboard preview";

		const header = document.createElement("h2");
		header.textContent = `${translation.leaderboard[this.language]}`;
		header.dataset.translate_inner = "leaderboard";
		container.appendChild(header);

		const leaderDisplay = document.createElement("div");
		leaderDisplay.className = "leader-display";

		const flame = document.createElement("img");
		flame.src = "../../static/elements/flame.gif";
		flame.className = "flame";
		leaderDisplay.appendChild(flame);

		if (this.leader) {
			const first = document.createElement("img");
			first.src = `https://${ip_address}:8000/media/${this.leader.profile_picture}`;
			first.className = "first-leader";
			leaderDisplay.appendChild(first);
		}

		container.appendChild(leaderDisplay);

		const leaderInfo = document.createElement("div");
		leaderInfo.className = "leader-info";
		leaderDisplay.appendChild(leaderInfo);

		const leaderName = document.createElement("span");
		leaderName.textContent = `${this.leader.username} - ${this.leader.score}`;
		leaderName.className = "leader-name";
		leaderInfo.appendChild(leaderName);

		const trophy = document.createElement("img");
		trophy.src = "../../static/elements/trophy.png";
		trophy.className = "leader-trophy";
		leaderInfo.appendChild(trophy);

		container.addEventListener("click", () => {
			this.viewController.transitionToLeaderboard(true, this.currentUser);
		});

		return container;
	}
}
