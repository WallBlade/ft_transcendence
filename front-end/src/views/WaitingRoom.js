import { translation } from "../js/translate.js";

export default class WaitingRoom {
	name = "WaitingRoom";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = "src/styles/waitingroom.css";
		this.rootDiv = document.getElementById("app");
		this.state = state;
	}

	loadCss() {
		if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
			const cssLink = document.createElement("link");
			cssLink.href = this.cssPath;
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";
			document.head.appendChild(cssLink);
		}
	}

	async render() {
		this.loadCss();

		this.rootDiv.innerHTML = "";

		this.state.setState({ waitingRoom: this });

		const container = document.createElement("div");
		container.className = "waiting-room-container";

		const header = document.createElement("h1");
		header.className = "waiting-room-header";
		header.textContent = `${translation.waitPlayer[this.language]}`;

		container.appendChild(header);

		const spinner = document.createElement("div");
		spinner.className = "spinner";

		const spinnerDot1 = document.createElement("div");
		spinnerDot1.className = "spinner-dot";

		const spinnerDot2 = document.createElement("div");
		spinnerDot2.className = "spinner-dot";

		const spinnerDot3 = document.createElement("div");
		spinnerDot3.className = "spinner-dot";

		spinner.appendChild(spinnerDot1);
		spinner.appendChild(spinnerDot2);
		spinner.appendChild(spinnerDot3);

		container.appendChild(spinner);

		return container;
	}

	async startGame() {
		this.state.setState({ isInWaitingRoom: false });
		this.state.setStateNotify({ currentView: "/game-online" });
	}

	async abortGame() {
		this.state.setState({ waitingRoom: null });
		this.state.setStateNotify({ currentView: "/home" });
	}
}

