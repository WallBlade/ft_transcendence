import { gsap, Power4, Elastic } from "gsap";
import { initThree } from "../threeInit.js";
import { translation } from "../js/translate.js";

export default class LandingPage {
	constructor(state) {
		this.language = localStorage.getItem("language") || "en";
		this.state = state;
		this.cssPath = "src/styles/landing.css";
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
		const rootDiv = document.getElementById("app");
		rootDiv.innerHTML = "";

		this.loadCss();

		const threeContainer = document.createElement("div");
		threeContainer.id = "threeContainer";

		const canvas = document.createElement("canvas");
		canvas.className = "webgl";
		threeContainer.appendChild(canvas);

		initThree(canvas);

		const container = document.createElement("div");
		container.className = "landing-container";

		const singinButton = this.createButton();

		this.state.addEventListener(singinButton, "click", this.handleClick.bind(this));

		container.appendChild(singinButton);
		container.appendChild(threeContainer);

		return container;
	}

	async handleClick() {
		const event = new CustomEvent("enterAtari");
		document.dispatchEvent(event);

		this.state.removeAllEventListeners();
		setTimeout(() => {
			if (this.state.getState().isAuth)
				this.state.setStateNotify({ currentView: "/home" });
			else
				this.state.setStateNotify({ currentView: "/sign-in" });
		}, 2000);
	}

	createButton() {
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'landing-button-container';

		const button = document.createElement("button");
		button.className = "magneto";

		const span = document.createElement("span");
		span.className = "text";
		if (this.state.getState().isAuth)
		{
			span.textContent = `${translation.home[this.language]}`;
			span.dataset.translate_inner = "home";
		}
		else
		{
			span.textContent = `${translation.signin[this.language]}`;
			span.dataset.translate_inner = "signin";
		}

		button.appendChild(span);

		this.animateButton(button, span);
		buttonContainer.appendChild(button);

		return buttonContainer;
	}

	animateButton(magneto, text) {
		const activateMagneto = (event) => {
			let boundBox = magneto.getBoundingClientRect();
			const magnetoStrength = 70;
			const magnetoTextStrength = 100;
			const newX = (event.clientX - boundBox.left) / magneto.offsetWidth - 0.5;
			const newY = (event.clientY - boundBox.top) / magneto.offsetHeight - 0.5;

			gsap.to(magneto, {
				duration: 1,
				x: newX * magnetoStrength,
				y: newY * magnetoStrength,
				ease: Power4.easeOut,
			});

			gsap.to(text, {
				duration: 1,
				x: newX * magnetoTextStrength,
				y: newY * magnetoTextStrength,
				ease: Power4.easeOut,
			});
		};

		const resetMagneto = (event) => {
			gsap.to(magneto, {
				duration: 1,
				x: 0,
				y: 0,
				ease: Elastic.easeOut,
			});

			gsap.to(text, {
				duration: 1,
				x: 0,
				y: 0,
				ease: Elastic.easeOut,
			});
		};

		magneto.addEventListener("mousemove", activateMagneto);
		magneto.addEventListener("mouseleave", resetMagneto);
	}
}
