import { translation } from "../../js/translate.js";

export default class tournamentPreview {
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = "src/components/tournamentPreview/tournamentPreview.css";
	}

	loadCss() {
		if (document.querySelector(`link[href="${this.cssPath}"]`)) {
			return;
		}
		const link = document.createElement("link");
		link.href = this.cssPath;
		link.rel = "stylesheet";
		link.type = "text/css";
		this.container = null;
		document.head.appendChild(link);
	}

	render() {
		this.loadCss();

		this.container = document.createElement("div");
		this.container.className = "tournament preview";

		const tournamentName = sessionStorage.getItem("tournamentName");
		if (tournamentName) {
			this.tournament(tournamentName, "Continue");
		} else {
			this.tournament(null, "Create");
		}
		return this.container;
	}

	async tournament(tournamentName, buttonLabel) {
		const header = document.createElement("h2");
		header.textContent = `${translation.tournament[this.language]}`;
		header.dataset.translate_inner = "tournament";
		this.container.appendChild(header);

		const tournamentContent = document.createElement("div");
		tournamentContent.className = "tournament-content";
		this.container.appendChild(tournamentContent);

		this.field = document.createElement("input");
		this.field.className = "tournament-field";
		this.field.placeholder = `${translation[buttonLabel.toLowerCase()][this.language]}`;
		this.field.dataset.translate_placeholder = buttonLabel.toLowerCase();
		if (tournamentName) {
			this.field.value = tournamentName;
			this.field.readOnly = true;
		}

		this.field.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				this.validateName();
			}
		});

		tournamentContent.appendChild(this.field);

		const button = document.createElement("button");
		button.className = "tournament-button";
		button.dataset.translate_inner = buttonLabel.toLowerCase();
		button.textContent = `${translation[buttonLabel.toLowerCase()][this.language]}`;
		tournamentContent.appendChild(button);

		button.addEventListener("click", () => {
			this.validateName();
		});
	}

	validateName() {
		if (!this.field.value) {
			this.field.placeholder = `${translation.tournamentNameComment2[this.language]}`;
			this.field.style.border = "1px solid red";
		} else if (this.field.value.length > 15) {
			this.field.value = "";
			this.field.placeholder = `${translation.tournamentNameComment3[this.language]}`;
			this.field.style.border = "1px solid red";
		} else {
			this.viewController.transitionToTournament(this.field.value);
		}
	}
}
