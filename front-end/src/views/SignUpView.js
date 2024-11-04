import { gsap, Power4 } from "gsap";
import InputTextField from "../components/inputTextField/inputTextField";
import SubmitButton from "../components/submitButton/SubmitButton";
const ip_address = import.meta.env.VITE_IP_ADDRESS;

import { translation } from "../js/translate";

export default class SignUpView {
	constructor(authComponent) {
		this.language = localStorage.getItem("language") || "en";
		this.authComponent = authComponent;
		this.step = 1;
		this.cssPath = "src/styles/signup.css";
		this.username = new InputTextField("username", `${translation.username[this.language]} :`, "text");
		this.password = new InputTextField("password", `${translation.password[this.language]} :`, "password");
		this.confirm = new InputTextField("password", `${translation.rpassword[this.language]} :`, "password");
		this.userData = {};
		this.selectedAvatar = null;
		this.fileInput = null;
		this.is_default_picture = true;
		this.submitForm = this.submitForm.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.errorMessage = null;
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

		let container = document.createElement("div");
		container.className = "signup-container";

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
		header.textContent = `${translation.signup[this.language]}`;
		headerContainer.appendChild(header);

		const closeButton = document.createElement("img");
		closeButton.src = "../static/elements/cross.png";
		closeButton.className = "close-button";
		closeButton.addEventListener("click", () => this.authComponent.signUpToSignIn());
		headerContainer.appendChild(closeButton);

		const contentContainer = document.createElement("div");
		contentContainer.className = "content-container";
		container.appendChild(contentContainer);

		const content = await this.collectUserData();
		contentContainer.appendChild(content);

		return container;
	}

	async collectUserData() {
		const formContainer = document.createElement("div");
		formContainer.className = "signup-user-data";

		const form = document.createElement("form");
		form.className = "signup-form";
		formContainer.appendChild(form);

		form.appendChild(this.username.render());
	
		if (this.errorMessage) {
			this.username.setBorderColor("red");
			this.username.setPlaceholder(`${this.errorMessage}`);
		} else {
			this.username.setPlaceholder(`${translation.usernameComment[this.language]}`);
		}
		this.username.setGridColumn("1 / 3");
	
		form.appendChild(this.password.render());
		this.password.setPlaceholder(`${translation.passwordComment[this.language]}`);

		form.appendChild(this.confirm.render());
		this.confirm.setPlaceholder(`${translation.passwordComment2[this.language]}`);

		formContainer.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				if (this.step === 1) {
					this.checkUserData();
				}
			}
		});

		const nextStepButton = document.createElement("img");
		nextStepButton.src = "../static/elements/nav_arrow.png";
		nextStepButton.className = "next-step-button";
		nextStepButton.addEventListener("click", () => {
			this.checkUserData();
		});
		form.appendChild(nextStepButton);

		return formContainer;
	}

	checkUserData() {
		if (this.username.value.length < 3) {
			this.username.setBorderColor("red");
			this.username.clearField();
			this.username.setPlaceholder(`${translation.passwordError1[this.language]}`);
		}
		if (this.username.value.length > 12) {
			this.username.setBorderColor("red");
			this.username.clearField();
			this.username.setPlaceholder(`${translation.passwordError5[this.language]}`);
		}
		if (this.password.value === "") {
			this.password.setBorderColor("red");
			this.password.clearField();
			this.password.setPlaceholder(`${translation.passwordError2[this.language]}`);
		}
		if (this.confirm.value === "") {
			this.confirm.setBorderColor("red");
			this.confirm.clearField();
			this.confirm.setPlaceholder(`${translation.passwordError3[this.language]}`);
		}
		if (this.password.value !== this.confirm.value) {
			this.password.setBorderColor("red");
			this.password.clearField();
			this.password.setPlaceholder(`${translation.passwordError4[this.language]}`);
			this.confirm.setBorderColor("red");
			this.confirm.clearField();
			this.confirm.setPlaceholder(`${translation.passwordError4[this.language]}`);
		}
		if (this.username.value.length >= 3 && this.username.value.length <= 12 && this.password.value !== "" && this.confirm.value !== "" && this.password.value === this.confirm.value) {
			this.transitionToStep(2);
		}
	}

	async collectAvatar() {
		const collectAvatarContainer = document.createElement("div");
		collectAvatarContainer.className = "signup-user-data";

		const avatarsContainer = document.createElement("div");
		avatarsContainer.className = "avatars-container";
		collectAvatarContainer.appendChild(avatarsContainer);

		const label = document.createElement("label");
		label.textContent = `${translation.avatar[this.language]}`;
		avatarsContainer.appendChild(label);

		avatarsContainer.appendChild(this.avatarSelector());

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "buttons-container";
		collectAvatarContainer.appendChild(buttonsContainer);

		const labelFile = document.createElement("label");
		labelFile.className = "upload-label";
		labelFile.textContent = `${translation.upload[this.language]}`;
		labelFile.htmlFor = "file-upload";
		buttonsContainer.appendChild(labelFile);

		this.fileInput = document.createElement("input");
		this.fileInput.type = "file";
		this.fileInput.className = "upload-input";
		this.fileInput.id = "file-upload";
		labelFile.appendChild(this.fileInput);

		const submitButton = new SubmitButton(`${translation.signup[this.language]}`, () => this.submitForm());
		buttonsContainer.appendChild(submitButton.render());

		return collectAvatarContainer;
	}

	keydownHandler(event) {
		if (event.key === "Enter") {
			this.submitForm();
		}
	}

	avatarSelector() {
		const avatarList = [
			"../../static/avatars/angel.png",
			"../../static/avatars/casper.png",
			"../../static/avatars/cleopatre.png",
			"../../static/avatars/cowbouille.png",
			"../../static/avatars/devil.png",
			"../../static/avatars/dracula.png",
			"../../static/avatars/jack.png",
			"../../static/avatars/king.png",
			"../../static/avatars/knight.png",
			"../../static/avatars/merlin.png",
			"../../static/avatars/paul.png",
			"../../static/avatars/scaph.png",
			"../../static/avatars/witch.png",
		];

		let avatarSelect = Math.floor(avatarList.length / 2);
		this.selectedAvatar = avatarList[avatarSelect].split("/").pop();

		const avatarChooser = document.createElement("div");
		avatarChooser.className = "avatar-chooser";

		const createArrow = (className, isLeft) => {
			const arrow = document.createElement("img");
			arrow.src = "../static/elements/nav_arrow.png";
			arrow.className = className;
			arrow.addEventListener("click", () => updateSelection(isLeft ? -1 : 1));
			avatarChooser.appendChild(arrow);
		};
		createArrow("left-arrow-button", true);

		const createAvatarImage = (className) => {
			const img = document.createElement("img");
			img.className = className;
			avatarChooser.appendChild(img);
			return img;
		};

		const avatars = {
			previousPrevious: createAvatarImage("previous-previous-avatar"),
			previous: createAvatarImage("previous-avatar"),
			current: createAvatarImage("current-avatar"),
			next: createAvatarImage("next-avatar"),
			nextNext: createAvatarImage("next-next-avatar"),
		};

		createArrow("right-arrow-button", false);

		const updateAvatarDisplay = () => {
			Object.keys(avatars).forEach((key, index) => {
				const position = (avatarSelect + index - 2 + avatarList.length) % avatarList.length;
				avatars[key].src = avatarList[position];
			});
		};

		const updateSelection = (direction) => {
			avatarSelect = (avatarSelect + direction + avatarList.length) % avatarList.length;
			this.selectedAvatar = avatarList[avatarSelect].split("/").pop();
			updateAvatarDisplay();
		};

		window.addEventListener("keydown", (event) => {
			if (event.key === "ArrowLeft") {
				updateSelection(-1);
			}
			if (event.key === "ArrowRight") {
				updateSelection(1);
			}
			updateAvatarDisplay();
		});

		updateAvatarDisplay();

		return avatarChooser;
	}

	async stepController(container) {
		let content;

		if (this.step === 1) {
			content = await this.collectUserData(container);
		} else if (this.step === 2) {
			content = await this.collectAvatar(container);
		}
		return content;
	}

	async transitionToStep(newStep) {
		if (newStep === 2) {
			this.userData = {
				username: this.username.value,
				password: this.password.value,
				confirm: this.confirm.value,
			};
		}
		this.step = newStep;
		const parentDiv = document.querySelector(".content-container");
		await gsap.to(parentDiv, {
			duration: 0.5,
			opacity: 0,
			ease: Power4.easeOut,
		});
		this.stepController(parentDiv).then((content) => {
			parentDiv.innerHTML = "";
			parentDiv.appendChild(content);
		});
		await gsap.to(parentDiv, {
			duration: 0.5,
			opacity: 1,
			ease: Power4.easeOut,
		});
	}

	prepareData() {
		if (this.fileInput.files[0]) {
			this.selectedFile = this.fileInput.files[0];
			this.is_default_picture = false;
		}
		const formData = new FormData();
		formData.append("username", this.userData.username);
		formData.append("tournamentName", this.userData.tournamentName);
		formData.append("password", this.userData.password);
		formData.append("confirm", this.userData.confirm);
		formData.append("is_default_picture", this.is_default_picture);
		if (!this.is_default_picture) {
			formData.append("profile_picture", this.selectedFile);
		} else {
			formData.append("profile_picture", this.selectedAvatar);
		}
		return formData;
	}

	async submitForm() {
		const formData = this.prepareData();
		try {
			const response = await fetch(`https://${ip_address}:8000/api/signup/`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.message === "A user with that username already exists") {
					this.errorMessage = data.message;
					this.transitionToStep(1);
					document.removeEventListener("keydown", this.keydownHandler);
				} else {
					throw new Error(`${data.message} (Success: ${data.succes})`);
				}
			} else {
				this.authComponent.navigateToHome('signup');
			}
		} catch (error) {
			console.error(error);
		}
	}
}
