import { translation } from "../../js/translate.js";

export default class InputTextField {
	constructor(name, label, type, inner = false, state) {
		this.name = name;
		this.label = label;

		this.type = type;
		this.value = "";
		this.cssPath = "src/components/inputTextField/inputTextField.css";
		this.errorMessageElement = null;
		this.inputElement = null;
		this.wrapper = null;
		this.inner = inner;
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

	render() {
		this.loadCss();

		this.wrapper = document.createElement("div");
		this.wrapper.className = "input-wrapper";

		const labelElement = document.createElement("label");
		labelElement.textContent = this.label;
		if (this.inner) {
			labelElement.dataset.translate_inner = this.name;
		} else {
			labelElement.dataset.translate_input = this.name;
		}
		this.wrapper.appendChild(labelElement);

		this.inputElement = document.createElement("input");
		this.inputElement.type = this.type;
		this.inputElement.name = this.name;
		this.inputElement.oninput = (e) => (this.value = e.target.value);
		this.wrapper.appendChild(this.inputElement);

		this.errorMessageElement = document.createElement("span");
		this.errorMessageElement.textContent = "\u00A0";
		this.errorMessageElement.className = "error-message";
		this.wrapper.appendChild(this.errorMessageElement);

		return this.wrapper;
	}

	unloadCss() {
		const cssLink = document.querySelector(`link[href="${this.cssPath}"]`);
		if (cssLink) {
			document.head.removeChild(cssLink);
		}
	}

	cleanup() {
		this.unloadCss();
	}

	setPlaceholder(placeholder) {
		if (this.inputElement) {
			this.inputElement.placeholder = placeholder;
		}
	}

	setErrorMessage(message) {
		this.errorMessageElement.classList.add("show");
		this.errorMessageElement.textContent = message;
		this.inputElement.classList.add("show");
	}

	removeErrorMessage() {
		this.errorMessageElement.remove();
	}

	setPlaceholder(placeholder) {
		this.inputElement.placeholder = placeholder;
	}

	setBorderColor(color) {
		this.inputElement.style.borderColor = color;
	}

	clearField() {
		this.inputElement.value = "";
	}

	setContent(content) {
		this.inputElement.value = content;
	}

	setGridColumn(column) {
		this.wrapper.style.gridColumn = column;
	}
}
