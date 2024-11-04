import Header from "../components/header.js";

export default class Page404 {
	constructor() {}

	render() {
		const element = document.createElement("div");

		const headerComponant = new Header("Welcome to the pong");
		element.appendChild(headerComponant);
		element.innerHTML += `
            <div>
				This is custom 404 not found.
            </div>
        `;
		return element;
	}
}
