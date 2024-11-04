import init from "../../js/game.js";

export default class GameView {
	constructor(GameLayer) {
		this.GameLayer = GameLayer;
	}

	render() {
		const element = document.createElement("div");
		const canvas = document.createElement("canvas");
		canvas.className = "webgl";
		element.appendChild(canvas);

		this.game(element, this.state);
		return element;
	}

	game(element, state) {
		const canvas = element.querySelector("canvas.webgl");
		init(canvas, this.GameLayer);
	}
}
