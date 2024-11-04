import gsap from "gsap";
import InputTextField from "../components/inputTextField/inputTextField";
import SubmitButton from "../components/submitButton/SubmitButton";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import { translation } from "../js/translate.js";

export default class SettingsView {
	name = "SettingsView";
	constructor(viewController, state) {
		this.language = localStorage.getItem("language") || "en";
		this.viewController = viewController;
		this.cssPath = ["src/styles/home.css", "src/styles/settings.css"];
		this.container = null;
		this.userdata = null;
		this.tokenFied = new InputTextField("token", null, "text");
		this.isTwoFactorAuth = false;
		this.qrCodeData = null;
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

	async render() {
		this.loadCss();

		await this.getUserData();

		this.container = document.createElement("div");
		this.container.className = "settings-container";
		this.container.id = "settings-container";

		this.settingsContent = document.createElement("div");
		this.settingsContent.className = "settings-content";

		gsap.set(this.container, { opacity: 0 });
		gsap.to(this.container, { duration: 0.5, opacity: 1 });

		this.header();
		this.form();

		this.authContent = document.createElement("div");
		this.authContent.className = "auth-content";

		this.auth2fa();

		this.validateDataContainer = document.createElement("div");
		this.validateDataContainer.className = "validate-data-container";

		await this.validateData();

		this.container.appendChild(this.authContent);
		this.container.appendChild(this.settingsContent);
		this.container.appendChild(this.validateDataContainer);

		return this.container;
	}

	header() {
		const headerContainer = document.createElement("div");
		headerContainer.className = "header-container-settings";

		const highlight = document.createElement("img");
		highlight.src = "../../static/elements/highlight.png";
		highlight.className = "highlight-settings";
		headerContainer.appendChild(highlight);

		const header = document.createElement("h1");
		header.textContent = `${translation.settings[this.language]}`;
		header.dataset.translate_inner = "settings";
		headerContainer.appendChild(header);

		this.container.appendChild(headerContainer);
	}

	form() {
		const formContainer = document.createElement("div");
		formContainer.className = "form-container";

		const avatar = document.createElement("div");

		const labelFile = document.createElement("label");
		labelFile.className = "classic-button file";
		labelFile.textContent = `${translation.upload[this.language]}`;
		labelFile.dataset.translate_inner = "upload";
		labelFile.htmlFor = "file-upload";
		const label = document.createElement("label");
		label.textContent = "Avatar :";
		avatar.appendChild(label);
		avatar.appendChild(labelFile);

		this.fileInput = document.createElement("input");
		this.fileInput.type = "file";
		this.fileInput.className = "classic";
		this.fileInput.id = "file-upload";
		avatar.appendChild(this.fileInput);

		this.settingsContent.appendChild(avatar);
	}

	auth2fa() {
		const auth2fa = document.createElement("div");
		auth2fa.className = "auth2fa";

		const headerContainer = document.createElement("div");
		headerContainer.className = "twofa-container-settings";

		const header = document.createElement("span");
		header.className = "twofa-header";
		header.textContent = "2FA";
		headerContainer.appendChild(header);

		const toggleButton = document.createElement("div");
		toggleButton.className = "toggle-button";

		const isOn = document.createElement("span");
		isOn.className = "is-on";
		isOn.textContent = "On";
		toggleButton.appendChild(isOn);

		const isOff = document.createElement("span");
		isOff.className = "is-off";
		isOff.textContent = "Off";
		toggleButton.appendChild(isOff);

		const toggle = document.createElement("div");
		toggle.className = "toggle";
		toggleButton.appendChild(toggle);

		headerContainer.appendChild(toggleButton);

		auth2fa.appendChild(headerContainer);

		this.qrCodeContainer = document.createElement("div");
		this.qrCodeContainer.className = "qr-code-container";

		this.qrCode = document.createElement("img");
		this.qrCode.className = "qr-code";

		this.qrCodeContainer.appendChild(this.qrCode);

		const instructionsContainer = document.createElement("div");
		instructionsContainer.className = "instructions-container";

		const textContainer = document.createElement("div");
		textContainer.className = "text-instructions-container";

		const firstInstruction = document.createElement("span");
		firstInstruction.textContent = `${translation.authApp[this.language]}`;
		firstInstruction.dataset.translate_inner = "authApp";
		textContainer.appendChild(firstInstruction);

		const secondInstruction = document.createElement("span");
		secondInstruction.textContent = `${translation.scanCode[this.language]}`;
		secondInstruction.dataset.translate_inner = "scanCode";
		textContainer.appendChild(secondInstruction);

		const thirdInstruction = document.createElement("span");
		thirdInstruction.textContent = `${translation.secretKey[this.language]}`;
		thirdInstruction.dataset.translate_inner = "secretKey";
		textContainer.appendChild(thirdInstruction);

		instructionsContainer.appendChild(textContainer);

		const tokenContainer = document.createElement("div");
		tokenContainer.className = "token-container";
		tokenContainer.appendChild(this.tokenFied.render());
		this.tokenFied.removeErrorMessage();

		const submitButtonContainer = document.createElement("div");
		submitButtonContainer.className = "submit-button-container";
		const submitButton = new SubmitButton(`${translation.submit[this.language]}`, async () => await this.post2fa(), true);
		submitButtonContainer.appendChild(submitButton.render());

		tokenContainer.appendChild(submitButtonContainer);

		instructionsContainer.appendChild(tokenContainer);

		this.qrCodeContainer.appendChild(instructionsContainer);

		this.auth2faAlreadySet = document.createElement("div");

		const auth2faAlreadySetHeader = document.createElement("p");
		auth2faAlreadySetHeader.textContent = `${translation.alreadySet[this.language]}`;
		auth2faAlreadySetHeader.dataset.translate_inner = "alreadySet";

		this.auth2faAlreadySet.appendChild(auth2faAlreadySetHeader);

		this.authContent.appendChild(auth2fa);

		if (this.userdata.user.is_2fa) {
			this.isTwoFactorAuth = !this.isTwoFactorAuth;
			toggle.classList.toggle("active");
			isOn.classList.toggle("active");
			isOff.classList.toggle("active");

			this.authContent.appendChild(this.auth2faAlreadySet);
		}

		toggleButton.addEventListener("click", async () => {
			toggle.classList.toggle("active");
			isOn.classList.toggle("active");
			isOff.classList.toggle("active");
			this.qrCodeContainer.classList.toggle("active");

			this.isTwoFactorAuth = !this.isTwoFactorAuth;

			if (this.isTwoFactorAuth && !this.userdata.user.is_2fa) {
				await this.setUp2fa();
			} else if (this.isTwoFactorAuth && this.userdata.user.is_2fa) {
				this.authContent.appendChild(this.auth2faAlreadySet);
			} else {
				this.qrCodeContainer.remove();
				this.auth2faAlreadySet.remove();
			}
		});
	}

	async validateData() {
		const saveButton = document.createElement("div");
		saveButton.className = "save-button";

		const save = document.createElement("span");
		save.className = "save-span";
		save.textContent = `${translation.save[this.language]}`;
		save.dataset.translate_inner = "save";
		saveButton.appendChild(save);
		this.validateDataContainer.appendChild(saveButton);

		saveButton.addEventListener("click", () => {
			this.patchUserData(saveButton);
		});
		return true;
	}

	async setUp2fa() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/2fa_setup/`, {
				credentials: "include",
			});
			const blob = await response.blob();
			this.qrCode.src = URL.createObjectURL(blob);
			this.authContent.appendChild(this.qrCodeContainer);
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async patchUserData(saveButton) {

		let is2fa;
		this.isTwoFactorAuth === true ? (is2fa = "true") : (is2fa = "false");

		let avatar;
		if (this.fileInput.files[0]) {
			avatar = this.fileInput.files[0];
		} else {
			avatar = this.userdata.user.profile_picture;
		}

		const formData = new FormData();

		if (this.isTwoFactorAuth !== this.userdata.user.is_2fa) {
			formData.append("is_2fa", is2fa);
		}
		if (avatar !== this.userdata.user.profile_picture) {
			formData.append("new_profile_picture", avatar);
		}

		try {
			const response = await fetch(`https://${ip_address}:8000/api/profile/`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
				saveButton.style.border = "2px solid red";
			}

			if (response.ok === true) {
				saveButton.style.border = "2px solid green";
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async post2fa() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/2fa_setup/`, {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					token: this.tokenFied.value,
				}),
			});

			const data = await response.json();
			if (response.ok === true) {
				this.tokenFied.clearField();
				this.tokenFied.setPlaceholder("Token validated");
				this.tokenFied.setBorderColor("green");
			} else {
				this.tokenFied.clearField();
				this.tokenFied.setPlaceholder(`${translation.invalidKey[this.language]}`);
				this.tokenFied.setBorderColor("red");
			}
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async getUserData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/profile/`, {
				method: "GET",
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok === true) {
				this.userdata = data;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async patchData() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/profile/${user.username}/`, {
				method: "PATCH",
				credentials: "include",
				body: JSON.stringify({
					avatar: this.avatar,
				}),
			});

			const data = await response.json();
			if (response.ok === true) {
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	remove() {
		if (this.container) {
			this.container.remove();
		}
	}
}
