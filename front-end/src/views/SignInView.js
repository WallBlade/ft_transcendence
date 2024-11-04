import { gsap, Power4 } from "gsap";
import InputTextField from "../components/inputTextField/inputTextField.js";
import SubmitButton from "../components/submitButton/SubmitButton.js";
const ip_address = import.meta.env.VITE_IP_ADDRESS;

import { translation } from "../js/translate.js";

export default class SignInView {
	constructor(authComponent) {
		this.language = localStorage.getItem("language") || "en";
		this.step = 1;
		this.authComponent = authComponent;
		this.cssPath = "src/styles/signin.css";
		this.userName = new InputTextField("username", `${translation.username[this.language]} :`, "text");
		this.password = new InputTextField("password", `${translation.password[this.language]} :`, "password");
		this.is2FA = false;
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

	unloadCss() {
		const cssLink = document.querySelector(`link[href="${this.cssPath}"]`);
		if (cssLink) {
			cssLink.remove();
		}
	}

	async render() {
		this.loadCss();

		let container = document.createElement("div");
		container.className = "signin-container";

		const highlight = document.createElement("img");
		highlight.src = "../static/elements/highlight.png";
		highlight.className = "highlight";
		container.appendChild(highlight);

		const firstRow = document.createElement("div");
		firstRow.className = "first-row";
		container.appendChild(firstRow);

		const headerContainer = document.createElement("div");
		headerContainer.className = "header-auth";
		firstRow.appendChild(headerContainer);

		const header = document.createElement("h1");
		header.textContent = `${translation.signin[this.language]}`;
		headerContainer.appendChild(header);

		const closeButton = document.createElement("img");
		closeButton.src = "../static/elements/cross.png";
		closeButton.className = "close-button";
		closeButton.addEventListener("click", () => {
			this.authComponent.closeAuth();
		});
		headerContainer.appendChild(closeButton);

		const contentContainer = document.createElement("div");
		contentContainer.className = "content-container";
		container.appendChild(contentContainer);

		const content = await this.collectUserData();
		contentContainer.appendChild(content);

		return container;
	}

	async collectUserData() {
		const fieldsContainer = document.createElement("div");
		fieldsContainer.className = "fields-container";

		const inputContainer = document.createElement("div");
		inputContainer.className = "input-container";
		fieldsContainer.appendChild(inputContainer);

		inputContainer.appendChild(this.userName.render());

		inputContainer.appendChild(this.password.render());

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "buttons-container";
		fieldsContainer.appendChild(buttonsContainer);

		const noAccountButton = document.createElement("span");
		noAccountButton.textContent = `${translation.noaccount[this.language]}`;
		noAccountButton.className = "no-account";
		noAccountButton.addEventListener("click", () => this.authComponent.signInToSignUp());
		buttonsContainer.appendChild(noAccountButton);

		const submitButton = new SubmitButton(`${translation.signin[this.language]}`, () => this.submitData());
		buttonsContainer.appendChild(submitButton.render());

		inputContainer.addEventListener("keydown", async (event) => {
			if (event.key === "Enter") {
				await this.submitData();
			}
		});

		return fieldsContainer;
	}

	async auth2FA() {
		const fieldsContainer = document.createElement("div");
		fieldsContainer.className = "fields-container";

		this.keyInput = new InputTextField("token", "2FA key :", "password");
		fieldsContainer.appendChild(this.keyInput.render());

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "buttons-container";
		fieldsContainer.appendChild(buttonsContainer);

		const submitButton = new SubmitButton(`${translation.submit[this.language]}`);
		buttonsContainer.appendChild(submitButton.render());

		buttonsContainer.addEventListener("click", async () => await this.submit2Fa());

		fieldsContainer.addEventListener("keydown", async (event) => {
			if (event.key === "Enter") {
				await this.submit2Fa();
			}
		});

		return fieldsContainer;
	}

	async stepController() {
		let content;
		const authContainer = document.querySelector(".auth");

		if (this.step === 1) {
			await gsap.to(authContainer, { duration: 0.5, height: "60vh", ease: "power4.out" });
			content = await this.collectUserData();
		} else if (this.step === 2) {
			await gsap.to(authContainer, { duration: 0.5, height: "30vh", ease: "power4.out" });
			content = await this.auth2FA();
		}
		return content;
	}

	async transitionToStep(newStep) {
		if (newStep === 2) {
			if (!this.userName || !this.password) {
				return false;
			}
		} else {
			this.submitData();
		}
		this.step = newStep;
		const parentDiv = document.querySelector(".content-container");
		const crossButton = document.querySelector(".close-button");
		crossButton.style.opacity = "0";
		await gsap.to(parentDiv, { duration: 0.5, opacity: 0, ease: Power4.easeOut });

		this.stepController(parentDiv).then((updatedView) => {
			parentDiv.innerHTML = "";
			parentDiv.appendChild(updatedView);
		});
		await gsap.to(parentDiv, { duration: 0.5, opacity: 1, ease: Power4.easeOut, delay: 0.5 });
	}

	async submit2Fa() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/2fa_auth/`, {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					token: this.keyInput.value,
				}),
			});

			const data = await response.json();
			if (!data.ok) {
				this.keyInput.setPlaceholder(`${translation.invalidKey[this.language]}`);
				this.keyInput.setBorderColor("red");
				this.keyInput.clearField();
			}
			if (data.ok) this.authComponent.state.setStateNotify({ currentView: "/home" });
		} catch (error) {
			console.error(error);
		}
	}

	async submitData() {
		const userData = {
			username: this.userName.value,
			password: this.password.value,
		};

		try {
			const response = await fetch(`https://${ip_address}:8000/api/signin/`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message);
			}

			if (data.is_2fa === true) {
				this.transitionToStep(2);
			} else {
				this.step = 1;
				this.authComponent.navigateToHome("signin");
			}
		} catch (error) {
			this.userName.setErrorMessage("\r");
			this.password.setErrorMessage(`${translation.invalidlogin[this.language]}`);
			console.error(error);
		}
	}
}
