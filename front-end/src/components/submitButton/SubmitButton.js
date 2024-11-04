export default class SubmitButton {
	constructor(text, onClickAction, trad = false) {
		this.text = text;
		this.onClickAction = onClickAction;
		this.cssPath = "src/components/submitButton/submitButton.css";
		this.trad = trad;
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

		const button = document.createElement("button");
		button.className = "submit-button";

		const span = document.createElement("span");
		span.className = "text";
		span.textContent = this.text;
		if (this.trad) {
			span.dataset.translate_inner = "submit";
		}
		button.appendChild(span);

		const arrow = document.createElement("img");
		arrow.src = "../static/elements/nav_arrow.png";
		arrow.className = "arrow";
		button.appendChild(arrow);

		button.addEventListener("click", this.onClickAction);

		return button;
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
}
