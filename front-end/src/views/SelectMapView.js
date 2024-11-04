import gsap from "gsap";
import { translation } from "../js/translate.js";

export default class SelectMapView {
	name = "SelectMapView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = "src/styles/selectmap.css";
		this.container = null;
		this.isMapSelected = false;
		this.level = null;
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

		this.container = document.createElement("div");
		this.container.className = "selectmap-container";

		gsap.set(this.container, { opacity: 0 });
		gsap.to(this.container, { opacity: 1, duration: 0.5 });

		this.describeMap();

		window.addEventListener("mousemove", this.handleMouseMove);

		return this.container;
	}

	describeMap() {
		const describeMapContainer = document.createElement("div");
		describeMapContainer.className = "describe-map-container";

		const mapHeader = document.createElement("h1");
		mapHeader.className = "map-header";
		mapHeader.textContent = `${translation.playheader[this.language]}`;
		mapHeader.dataset.translate_inner = "playheader";
		describeMapContainer.appendChild(mapHeader);

		const mapDescription = document.createElement("p");
		mapDescription.className = "map-description";
		mapDescription.textContent = `${translation.playcontent[this.language]}`;
		mapDescription.dataset.translate_inner = "playcontent";
		describeMapContainer.appendChild(mapDescription);

		const choicesContainer = document.createElement("div");
		choicesContainer.className = "choices-container";
		const choices = document.createElement("div");
		choices.className = "choices";
		choicesContainer.appendChild(choices);
		describeMapContainer.appendChild(choicesContainer);

		const localButton = document.createElement("div");
		localButton.id = "type";
		localButton.className = "choice-type-button not";
		localButton.textContent = "LOCAL";
		choices.appendChild(localButton);

		const aiButton = document.createElement("div");
		aiButton.id = "type";
		aiButton.className = "choice-type-button not";
		aiButton.textContent = `${translation.ai[this.language]}`;
		aiButton.dataset.translate_inner = "ai";
		choices.appendChild(aiButton);

		const iaChoice = this.chooseIA();

		let type = 'none';
		let isIa = false;

		localButton.addEventListener("click", () => {
			if (isIa) iaChoice.remove();
			this.resetTypeButtonsStates();
			localButton.classList.add("selected");
			localButton.classList.remove("not");
			type = "local";
			isIa = false;
		});

		aiButton.addEventListener("click", () => {
			this.resetTypeButtonsStates();
			aiButton.classList.add("selected");
			aiButton.classList.remove("not");
			type = "ai";
			choicesContainer.appendChild(iaChoice);
			isIa = true;
		});

		const playButton = document.createElement('div');
		playButton.className = 'play-button';
		playButton.textContent = `${translation.play[this.language]}`;
		playButton.dataset.translate_inner = "play";
		playButton.addEventListener('click', () => {
			if (type !== 'none') {
				if (type === 'ai' && this.level !== null) {
					sessionStorage.setItem('difficulty', JSON.stringify(this.level));
					this.state.setStateNotify({currentView: '/game-ai'});
				}
				else if (type === 'local') {
					this.state.setStateNotify({currentView: '/game'});
				}
			}
		});
		describeMapContainer.appendChild(playButton);

		this.container.appendChild(describeMapContainer);
	}

	chooseIA() {
		const aiContainer = document.createElement("div");
		aiContainer.className = "ai-container";
		aiContainer.id = "ai-container";

		const easyButton = document.createElement("div");
		easyButton.className = "choice-level-button not";
		easyButton.textContent = `${translation.easy[this.language]}`;
		easyButton.dataset.translate_inner = "easy";
		aiContainer.appendChild(easyButton);

		const mediumButton = document.createElement("div");
		mediumButton.className = "choice-level-button not";
		mediumButton.textContent = `${translation.medium[this.language]}`;
		mediumButton.dataset.translate_inner = "medium";
		aiContainer.appendChild(mediumButton);

		const HardButton = document.createElement("div");
		HardButton.className = "choice-level-button not";
		HardButton.textContent = `${translation.hard[this.language]}`;
		HardButton.dataset.translate_inner = "hard";
		aiContainer.appendChild(HardButton);

		easyButton.addEventListener("click", () => {
			this.resetLevelButtonsStates();
			easyButton.classList.add("selected");
			easyButton.classList.remove("not");
			this.level = "easy";
		});

		mediumButton.addEventListener("click", () => {
			this.resetLevelButtonsStates();
			mediumButton.classList.add("selected");
			mediumButton.classList.remove("not");
			this.level = "medium";
		});

		HardButton.addEventListener("click", () => {
			this.resetLevelButtonsStates();
			HardButton.classList.add("selected");
			HardButton.classList.remove("not");
			this.level = "hard";
		});

		return aiContainer;
	}

	resetTypeButtonsStates() {
		const buttons = document.querySelectorAll(".choice-type-button");
		buttons.forEach((button) => {
			button.classList.remove("selected");
			button.classList.add("not");
		});
	}

	resetLevelButtonsStates() {
		const buttons = document.querySelectorAll(".choice-level-button");
		buttons.forEach((button) => {
			button.classList.remove("selected");
			button.classList.add("not");
		});
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}
}
