import { translate } from "../../js/translate.js";

export default class Header {
	constructor(user, viewController, state) {
		this.viewController = viewController;
		this.username = user.username;
		this.score = user.score;
		this.state = state;
		this.cssPath = "src/components/headerComponent/headerComponent.css";
		this.state = state;
	}

	loadCss() {
		return new Promise((resolve, reject) => {
			if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
				const cssLink = document.createElement("link");
				cssLink.href = this.cssPath;
				cssLink.rel = "stylesheet";
				cssLink.type = "text/css";
				cssLink.onload = resolve;
				cssLink.onerror = reject;
				document.head.appendChild(cssLink);
			} else {
				resolve();
			}
		});
	}

	async render() {
		this.loadCss();

		const headerContainer = document.createElement("div");
		headerContainer.className = "header-container";

		const header = document.createElement("header");
		header.className = "header";
		headerContainer.appendChild(header);

		const homeButton = document.createElement("img");
		homeButton.src = "../static/elements/home.png";
		homeButton.className = "home";
		homeButton.id = "home";
		header.appendChild(homeButton);

		homeButton.addEventListener("click", () => {
			const event = new CustomEvent("leaveSelectMap");
			window.dispatchEvent(event);

			this.state.setStateNotify({ currentView: "/home" });
		});

		const dataContainer = document.createElement("div");
		dataContainer.className = "header-data-container";
		header.appendChild(dataContainer);

		const langContainer = document.createElement("div");
		dataContainer.appendChild(langContainer);

		const enLangButton = document.createElement("span");
		enLangButton.innerText = "EN";
		enLangButton.style.cursor = "pointer";
		enLangButton.addEventListener("click", () => {
			localStorage.setItem("language", "en");
			translate("en");
	});
		langContainer.appendChild(enLangButton);

		let langSeparator = document.createElement("span");
		langSeparator.innerText = " / ";
		langContainer.appendChild(langSeparator);

		const frLangButton = document.createElement("span");

		frLangButton.innerText = "FR";
		frLangButton.style.cursor = "pointer";
		frLangButton.addEventListener("click", () => {
			localStorage.setItem("language", "fr");
			translate("fr");
		});
		langContainer.appendChild(frLangButton);

		langSeparator = document.createElement("span");
		langSeparator.innerText = " / ";
		langContainer.appendChild(langSeparator);

		const esLangButton = document.createElement("span");
		esLangButton.innerText = "ES";
		esLangButton.style.cursor = "pointer";
		esLangButton.addEventListener("click", () => {
			localStorage.setItem("language", "es");
			translate("es");
		});
		langContainer.appendChild(esLangButton);

		const scoreContainer = document.createElement("div");
		scoreContainer.className = "header-score-container";
		dataContainer.appendChild(scoreContainer);

		const scoreValue = document.createElement("span");
		scoreValue.className = "score-value";
		scoreValue.textContent = this.score;
		scoreContainer.appendChild(scoreValue);

		const trophy = document.createElement("img");
		trophy.src = "../static/elements/trophy.png";
		trophy.className = "header-trophy";
		scoreContainer.appendChild(trophy);

		const userContainer = document.createElement("div");
		userContainer.className = "header-user-container";
		dataContainer.appendChild(userContainer);

		const username = document.createElement("span");
		username.className = "username";
		username.textContent = this.username;
		userContainer.appendChild(username);

		const logout = document.createElement("img");
		logout.src = "../static/elements/logout.png";
		logout.className = "logout";
		userContainer.appendChild(logout);

		logout.addEventListener("click", () => {
			this.viewController.logout();
		});

		return headerContainer;
	}
}
