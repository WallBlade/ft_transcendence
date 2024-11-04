import gsap from "gsap";

export default class ViewControllerGame {
	constructor() {}

	transitionToGame() {
		const tl = gsap.timeline({paused: true});
		const app = document.getElementById("app");
		const observer = new MutationObserver((mutationsList, observer) => {
			// Look through all mutations that just occured
			for (let mutation of mutationsList) {
				// If the addedNodes property has one or more nodes
				if (mutation.addedNodes.length) {
					const versusContainer = document.getElementById("versus-container");
					if (versusContainer) {
						const player1 = document.getElementById("player1");
						const player2 = document.getElementById("player2");
						const separator = document.getElementById("separator");
						setInterval(() => {
							tl.to(player1, {
								duration: 2.5,
								opacity: 0,
								y: -250,
								ease: "power4.out",
							}, 0)
							.to(player2, {
								duration: 2.5,
								opacity: 0,
								y: 250,
								ease: "power4.out",
							}, 0)
							.to(separator, {
								duration: 2.5,
								height: 230,
								ease: "power4.out",
							}, 0)
							.to(player1, {
								duration: 1.5,
								opacity: 0,
								ease: "power4.out",
							}, 1)
							.to(player2, {
								duration: 1.5,
								opacity: 0,
								ease: "power4.out",
							}, 1);

							tl.play().then(() => {
								tl.clear();
								versusContainer.remove();
								const event = new CustomEvent("game-started");
								window.dispatchEvent(event);
							});
						}, 1500);
						observer.disconnect(); // Stop observing
					}
				}
			}
		});

		// Start observing the app with configured parameters
		observer.observe(app, { childList: true, subtree: true });
	}
}
