import LandingPage from "./views/LandingView.js";
import AuthComponent from "./components/authComponent/authComponent.js";
import ViewLayers from "./views/ViewLayers.js";
import GameLayer from "./views/game/gameLayer.js";

import { gsap, Power4 } from "gsap";
import HomeView from "./views/HomeView.js";
import ViewController from "./views/HomeViewController.js";
import LeaderboardView from "./views/LeaderboardView.js";
import ProfileView from "./views/ProfileView.js";
import WaitingRoom from "./views/WaitingRoom.js";
import TournamentView from "./views/TournamentView.js";

const ip_address = import.meta.env.VITE_IP_ADDRESS;

const connectNotificationSocket = async (state) => {
	state.setState({
		notificationSocket: new WebSocket(`wss://${ip_address}:8000/wss/notification/`),
	});
	const ws = state.getState().notificationSocket;

	ws.onopen = function () {
		// console.log("Websocket front/back opened.");
	};

	ws.onmessage = function (event) {
		const data = JSON.parse(event.data);
		if (data.notification_type === "friend_request" || data.notification_type === "game_invitation") {
			state.getState().notifications.receiveNotifications(data.content, data.notification_type);
		} else if (data.notification_type === "update_status") {
			const status = { status: data.status, user: data.user };
			state.updateStatus(status);
		} else if (state.getState().waitingRoom && data.notification_type === "start_remote_game") {
			state.getState().waitingRoom.startGame();
		} else if (state.getState().waitingRoom  && data.notification_type === "game_invitation_declined"){
			state.getState().waitingRoom.abortGame();
		}
	};

	ws.onerror = function () {
		console.error("Error Websocket", error);
	};

	ws.onclose = function () {
		// console.log("Websocket front/back closed.");
	};
};

async function updatePageContent(state, page) {
	const rootDiv = document.getElementById("app");
	let toRender;

	if (state.getState().isInWaitingRoom && page !== "/waiting-room")
		state.getState().notificationSocket.send(JSON.stringify({ notification_type: "leave_waiting_room" }));

	if (state.getState().gameSocket && state.getState().gameSocket.readyState === state.getState().gameSocket.OPEN)
		state.getState().gameSocket.close();

	const viewController = new ViewController(state);

	if (page === "/") {
		const landingPage = new LandingPage(state);
		toRender = await landingPage.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/sign-in" || page === "/sign-up") {
		const authComponent = new AuthComponent(page, state);
		toRender = await authComponent.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/home") {
		rootDiv.innerHTML = "";
		const event = new CustomEvent("leaveSelectMap");
		window.dispatchEvent(event);
		gsap.set(rootDiv, { opacity: 0 });
		const homeView = new HomeView(viewController, state);
		const homePage = new ViewLayers(viewController, homeView, state);
		toRender = await homePage.render();
		rootDiv.appendChild(toRender);
		gsap.to(rootDiv, { duration: 1, opacity: 1, ease: Power4.easeOut });
	} else if (page === "/leaderboard") {
		rootDiv.innerHTML = "";
		const leaderboard = new LeaderboardView(viewController, state);
		const homePage = new ViewLayers(viewController, leaderboard, state);
		toRender = await homePage.render();
		rootDiv.appendChild(toRender);
		const event = new CustomEvent("removeField");
		window.dispatchEvent(event);
	} else if (page === "/profile") {
		rootDiv.innerHTML = "";
		const profile = new ProfileView(viewController, state);
		const homePage = new ViewLayers(viewController, profile, state);
		toRender = await homePage.render();
		rootDiv.appendChild(toRender);
		const event = new CustomEvent("removeField");
		window.dispatchEvent(event);
	} else if (page === "/tournament") {
		rootDiv.innerHTML = "";
		const tournament = new TournamentView(viewController, state);
		const tournamentPage = new ViewLayers(viewController, tournament, state);
		toRender = await tournamentPage.render();
		rootDiv.appendChild(toRender);
		const event = new CustomEvent("tournamentSelected");
		window.dispatchEvent(event);
	} else if (page === "/game") {
		const gamePage = new GameLayer(state, "local");
		toRender = await gamePage.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/game-online") {
		const gamePage = new GameLayer(state, "online");
		toRender = await gamePage.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/game-tournament") {
		const gamePage = new GameLayer(state, "tournament");
		toRender = await gamePage.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/game-ai") {
		const gamePage = new GameLayer(state, "ia");
		toRender = await gamePage.render();
		rootDiv.appendChild(toRender);
	} else if (page === "/waiting-room") {
		const waitingRoom = new WaitingRoom(viewController, state);
		toRender = await waitingRoom.render();
		rootDiv.appendChild(toRender);
	}
}

async function isAuth(state) {
	try {
		const response = await fetch(`https://${ip_address}:8000/api/auth_check/`, {
			method: "GET",
			credentials: "include",
		});

		const data = await response.json();
		const ws = state.getState().notificationSocket;

		if (data.ok) {
			if (!ws || ws.readyState !== WebSocket.OPEN)
				await connectNotificationSocket(state);
			return true;
		} else {
			if (!ws && ws.readyState === WebSocket.OPEN) 
				state.getState().notificationSocket.close();
			return false;
		}
	} catch (error) {
		if (!ws && ws.readyState === WebSocket.OPEN)
			state.getState().notificationSocket.close();
		return false;
	}
}

function getRoute(state) {
	const route = window.location.pathname;
	const allowedRoutes = ["/", "/sign-in", "/sign-up", "/home", "/leaderboard", 
							"/profile", "/tournament", "/game",];

	if (!state.getState().isAuth && route !== "/sign-in" && route !== "/sign-up" && route !== "/") {
		window.history.replaceState(null, "", "/sign-in");
		return "/sign-in";
	}

	if (!allowedRoutes.includes(route)) {
		window.history.replaceState(null, "", "/home");
		return "/home";
	}
	
	if (route === "/tournament" && !sessionStorage.getItem("tournamentName")) {
		window.history.replaceState(null, "", "/home");
		return "/home";
	}

	if (!state.getState().isInTournament && route === "/tournament") {
		window.history.replaceState(null, "", "/home");
		return "/home";
	}
	return route;
}

document.addEventListener("DOMContentLoaded", async () => {
	class StateClass {
		constructor() {
			this.state = {
				listeners: [],
				onlineStatus: [],
				isAuth: false,
				isInTournament: false,
				notificationSocket: false,
				isInWaitingRoom: false,
				gameSocket: false,
				gameId: null,
				gameStopped: false,
			};
			this.listeners = [];
		}

		setStateNotify(newState) {
			this.state = { ...this.state, ...newState };
			this.notifyListeners();
		}

		addEventListener(target, eventType, listener) {
			target.addEventListener(eventType, listener);
			this.state.listeners.push({ target, eventType, listener });
		}

		removeAllEventListeners() {
			for (const { target, eventType, listener } of this.state.listeners) {
				target.removeEventListener(eventType, listener);
			}
			this.state.listeners = [];
		}

		updateStatus(status) {
			const index = this.state.onlineStatus.findIndex((item) => item.user === status.user);

			if (index !== -1) {
				this.state.onlineStatus[index].status = status.status;
			} else {
				this.state.onlineStatus.push(status);
			}

			let user = document.getElementById(status.user);

			if (user && user.classList.contains("user-status")) {
				if (user.classList.contains("online")) user.classList.remove("online");
				else if (user.classList.contains("offline")) user.classList.remove("offline");
				else if (user.classList.contains("in_game")) user.classList.remove("in_game");
				user.classList.add(status.status);
			}
		}

		setState(newState) {
			this.state = { ...this.state, ...newState };
		}

		getState() {
			return this.state;
		}

		addListener(listener) {
			this.listeners.push(listener);
		}

		notifyListeners() {
			for (const listener of this.listeners) {
				listener(this.state);
			}
		}
	}
	let state = new StateClass();

	state.setState({ isAuth: await isAuth(state) });

	const route = getRoute(state);
	updatePageContent(state, route);

	state.addListener(async (newState) => {
		if (newState.currentView) {
			state.setState({ isAuth: await isAuth(state) });
			updatePageContent(state, newState.currentView);
			history.pushState({ page: newState.currentView }, null, newState.currentView);
		}
	});

	window.addEventListener("popstate", async () => {
		state.setState({ isAuth: await isAuth(state) });
		state.removeAllEventListeners();

		const route = getRoute(state);
		updatePageContent(state, route);
	});
});
