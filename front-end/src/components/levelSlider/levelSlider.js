import { debounce } from "../../helpers/utils.js";
import { gsap } from "gsap";
import { translation } from "../../js/translate.js";

export default class SliderComponent {
	constructor(labels) {
		this.labels = labels;
		this.cssPath = "src/components/levelSlider/levelSlider.css";
		this.isThumbSelected = false;
		this.selectedLabel = null;
		this.sliderContainer = null;
		this.labelsContainer = null;
		this.trackWrapper = null;
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

		// Create the main container
		this.sliderContainer = document.createElement("div");
		this.sliderContainer.className = "slider-container";

		// Create the track wrapper
		this.trackWrapper = document.createElement("div");
		this.trackWrapper.className = "track-wrapper";

		this.sliderContainer.appendChild(this.trackWrapper);

		// Create the thumb
		const thumb = document.createElement("div");
		thumb.className = "slider-thumb";
		thumb.style.opacity = "0"; // Initially hidden
		this.trackWrapper.appendChild(thumb);

		// Create the labels container
		this.labelsContainer = document.createElement("div");
		this.labelsContainer.className = "labels-container";
		this.sliderContainer.appendChild(this.labelsContainer);

		// Create each label and corresponding input

		this.labels.forEach((label, index) => {
			const { labelElement, circle } = this.createLabel(label, index, this.labelsContainer);

			// Delay the position calculation to ensure the browser has rendered the elements
			setTimeout(() => {
				this.updateCirclePositions();
			}, 1000); // Small delay
		});

		this.trackWrapper.addEventListener("mouseenter", () => {
			thumb.style.opacity = "1";
		});

		// Save the currently selected circle
		this.currentlySelectedCircle = null;

		this.trackWrapper.addEventListener("click", (event) => {
			this.moveThumbToNearestCircle(thumb, event);

			const newSelectedCircle = this.findNearestCircle(event);
			if (newSelectedCircle !== this.currentlySelectedCircle) {
				// Reset previous selections if a different circle is selected
				this.resetCircleSelections(this.trackWrapper);
				this.resetLabelSelections(this.labelsContainer);
				newSelectedCircle.classList.add("selected");
				gsap.to(newSelectedCircle, { scale: 1.2, duration: 0.3 });
				this.currentlySelectedCircle = newSelectedCircle;

				const labelId = newSelectedCircle.dataset.labelId;
				const correspondingLabel = document.getElementById(labelId);

				if (correspondingLabel) {
					correspondingLabel.classList.add("selected");
					this.setSelectedLabel(correspondingLabel);
				}
			}
		});

		this.trackWrapper.addEventListener("mousemove", (event) => {
			this.moveThumbToNearestCircle(thumb, event);
		});

		this.trackWrapper.addEventListener("mouseleave", () => {
			if (!this.isThumbSelected) {
				thumb.style.opacity = "0"; // Or keep it at the last position
			}
		});

		// Setup resize listener
		this.setupResizeListener();

		return this.sliderContainer;
	}

	setupResizeListener() {
		const debouncedReposition = debounce(() => {
			this.updateCirclePositions();
		}, 250);
		window.addEventListener("resize", debouncedReposition);
	}

	setSelectedLabel(label) {
		this.selectedLabel = label;
	}

	getSelectedLabel() {
		return this.selectedLabel;
	}

	getIsThumbSelected() {
		return this.isThumbSelected;
	}

	createInput(index) {
		const input = document.createElement("input");
		input.type = "radio";
		input.id = `option-${index}`;
		input.name = "level";
		input.hidden = true;
		return input;
	}

	createLabel(label, index, labelsContainer) {
		const labelElement = document.createElement("label");
		labelElement.htmlFor = `option-${index}`;
		labelElement.textContent = label;
		labelElement.className = "slider-label";
		labelElement.id = `label-${index}`;

		const circle = document.createElement("div");
		circle.className = "label-circle";
		circle.id = `circle-${index}`;
		circle.dataset.labelId = `label-${index}`;
		this.trackWrapper.appendChild(circle);

		labelsContainer.appendChild(labelElement);
		return { labelElement, circle };
	}

	findNearestCircle(event) {
		const trackRect = this.trackWrapper.getBoundingClientRect();
		const mouseXPosition = event.clientX - trackRect.left;
		let nearestCircle = null;
		let minDistance = Infinity;

		this.labels.forEach((_, index) => {
			const circle = this.trackWrapper.querySelector(`#circle-${index}`);
			const circleRect = circle.getBoundingClientRect();
			const circleCenter = circleRect.left - trackRect.left + circleRect.width / 2;
			const distance = Math.abs(mouseXPosition - circleCenter);

			if (distance < minDistance) {
				minDistance = distance;
				nearestCircle = circle;
			}
		});

		return nearestCircle;
	}

	updateCirclePositions() {
		if (!this.sliderContainer || !this.labelsContainer) return;
		this.labels.forEach((label, index) => {
			const circle = this.trackWrapper.querySelector(`#circle-${index}`);
			const labelElement = this.labelsContainer.querySelector(`label[for='option-${index}']`);

			if (circle && labelElement) {
				const labelRect = labelElement.getBoundingClientRect();
				const trackRect = this.trackWrapper.getBoundingClientRect();
				const circleHeight = trackRect.height / 2;
				const circleWidth = circleHeight;
				circle.style.height = `${circleHeight}px`;
				circle.style.width = `${circleWidth}px`;
				const circleTop = trackRect.height / 2 - circle.offsetHeight / 2;
				const circleLeft = labelRect.left + labelRect.width / 2 - trackRect.left - circle.offsetWidth / 2;
				circle.style.top = `${circleTop}px`;
				circle.style.left = `${circleLeft}px`;
			}
		});
	}

	resetCircleSelections() {
		const allCircles = this.trackWrapper.querySelectorAll(".label-circle");
		allCircles.forEach((circle) => {
			circle.classList.remove("selected");
		});
	}

	resetLabelSelections() {
		const allLabels = this.labelsContainer.querySelectorAll(".slider-label");
		allLabels.forEach((label) => {
			label.classList.remove("selected");
		});
	}

	moveThumbToNearestCircle(thumb, event) {
		const nearestCircle = this.findNearestCircle(event);
		if (nearestCircle) {
			const trackRect = this.trackWrapper.getBoundingClientRect();
			const circleRect = nearestCircle.getBoundingClientRect();
			const thumbPosition = circleRect.left - trackRect.left + circleRect.width / 2;
			gsap.to(thumb, { left: thumbPosition, duration: 0 });
		}
	}
}
