import ProfileView from "./ProfileView.js";
import LeaderboardView from "./LeaderboardView.js";
import SelectMapView from "./SelectMapView.js";
import TournamentView from "./TournamentView.js";
import GridView from "./GridView.js";
import HomeView from "./HomeView.js";
import SettingsView from "./SettingsView.js";
import WaitingRoom from "./WaitingRoom.js";
const ip_address = import.meta.env.VITE_IP_ADDRESS;
import boxValue from "../helpers/boxValue.js";

import { translate } from "../js/translate.js";

export default class ViewController {
	constructor(state) {
		this.state = state;
		this.currentView = new HomeView(this.state);
		this.prevView = null;

		this.ProfileView = new ProfileView(this, this.state);
		this.LeaderboardView = new LeaderboardView(this);
		this.SelectMapView = new SelectMapView(this, this.state);
		this.TournamentView = new TournamentView(this, this.state);
		this.GridView = new GridView(this);
		this.HomeView = new HomeView(this, this.state);
		this.SettingsView = new SettingsView(this, state);
		this.WaitingRoom = new WaitingRoom(this, state);

		this.backwardStack = [];
		this.forwardStack = [];
		this.animationDuration = 1200;
	}

	async transitionToProfile(pushToStack = true, username = null) {
		// add current view to backward stack
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}
		this.currentView = this.ProfileView;
		let toRemove;
		if (this.prevView && this.prevView.name === this.SettingsView.name) {
			toRemove = document.getElementById("settings-container");
		} else {
			toRemove = document.getElementById("home-container");
		}
		toRemove.remove();

		const event = new CustomEvent("removeField");
		window.dispatchEvent(event);

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");

		const profileView = new ProfileView(this, this.state);
		await profileView.preload(homeContainer).then(async () => {
			this.GridView.animateToProfile();
			setTimeout(async () => {
				const profile = await profileView.render(username);
				homeContainer.appendChild(profile);
				history.pushState({ page: "/profile" }, null, "/profile");
			}, this.animationDuration);
		});
	}

	async goToSettings(pushToStack = true) {
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}
		this.currentView = this.SettingsView;
		const homeContainer = document.getElementById("home-container");
		homeContainer.remove();

		this.GridView.animateProfileToSettings();

		const appContainer = document.getElementById("app");
		const homeLayerContainer = appContainer.querySelector(".home-layer-container");
		const mainContainer = homeLayerContainer.querySelector(".main-container");
		setTimeout(async () => {
			const settingsView = await this.SettingsView.render();
			mainContainer.appendChild(settingsView);
		}, 1500);
	}

	async closeSettings() {
		this.SettingsView.remove();

		this.GridView.animateSettingsToProfile();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".home-layer-container");
		const mainContainer = homeContainer.querySelector(".main-container");
		setTimeout(async () => {
			const profileView = await this.ProfileView.render();
			mainContainer.appendChild(profileView);
		}, 1500);
	}

	async transitionToLeaderboard(pushToStack = true, username = null) {
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}
		this.currentView = this.LeaderboardView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		const event = new CustomEvent("removeField");
		window.dispatchEvent(event);

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");

		const lbView = new LeaderboardView(this, this.state);
		await lbView.preload(homeContainer).then(async () => {
			this.GridView.animateToLeaderboard();
			setTimeout(async () => {
				const lbrender = await lbView.render(username);
				homeContainer.appendChild(lbrender);
				history.pushState({ page: "/leaderboard" }, null, "/leaderboard");
			}, 1500);
		});
	}

	async transitionToSelectMap(pushToStack = true) {
		// add current view to backward stack
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}
		this.currentView = this.SelectMapView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		this.GridView.animateToSelectMap();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");
		const selectMapView = new SelectMapView(this, this.state);
		setTimeout(async () => {
			const selectMapRender = await selectMapView.render();
			homeContainer.appendChild(selectMapRender);
		}, 2000);
	}

	async transitionToTournament(tournamentName, pushToStack = true) {
		// add current view to backward stack
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}
		this.currentView = this.TournamentView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		const event = new CustomEvent("tournamentSelected");
		window.dispatchEvent(event);

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");

		const tournamentView = new TournamentView(this, this.state);
		await tournamentView.preload(homeContainer).then(async () => {
			this.GridView.animateToTournament();
			setTimeout(async () => {
				const tournamentRender = await tournamentView.render(tournamentName);
				homeContainer.appendChild(tournamentRender);
				history.pushState({ page: "/tournament" }, null, "/tournament");
			}, this.animationDuration);
		});
	}

	async transitionToOpenFriends() {
		this.GridView.openFriends();

		const appContainer = document.getElementById("app");
		const homeLayerContainer = appContainer.querySelector(".home-layer-container");
		const homeContainer = homeLayerContainer.querySelector(".home-container");
		const homeGridLayout = homeContainer.querySelector(".home-grid-layout");
		const friendsOpen = homeGridLayout.querySelector(".friends-open");
		friendsOpen.style.display = "flex";
		const leaderboard = homeGridLayout.querySelector(".leaderboard");
		leaderboard.style.display = "none";

		if (this.HomeView.isNotificationsOpen) {
			const notificationsOpen = homeGridLayout.querySelector(".notifications-open");
			notificationsOpen.style.display = "none";
		}
	}

	async transitionToCloseFriends() {
		this.GridView.closeFriends();

		const appContainer = document.getElementById("app");
		const homeLayerContainer = appContainer.querySelector(".home-layer-container");
		const homeContainer = homeLayerContainer.querySelector(".home-container");
		const homeGridLayout = homeContainer.querySelector(".home-grid-layout");
		const friendsOpen = homeGridLayout.querySelector(".friends-open");
		const leaderboard = homeGridLayout.querySelector(".leaderboard");
		setTimeout(() => {
			friendsOpen.style.display = "none";
			leaderboard.style.display = "flex";
		}, 1500);
	}

	async transitionLeaderboardToProfile(pushToStack = true, username) {
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}

		this.prevView = this.currentView;
		this.currentView = this.ProfileView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");

		const profileView = new ProfileView(this, this.state);
		await profileView.preload(homeContainer).then(async () => {
			this.GridView.animateLeaderboardToProfile();
			setTimeout(async () => {
				const profile = await profileView.render(username);
				homeContainer.appendChild(profile);
				history.pushState({ page: "/profile" }, null, "/profile");
			}, 1800);
		});
	}

	async transitionProfileBackToLeaderboard(pushToStack = true) {
		if (pushToStack) {
			this.backwardStack.push(this.currentView);
		}

		this.currentView = this.LeaderboardView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		this.GridView.animateProfileBackToLeaderboard();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");
		setTimeout(async () => {
			const leaderboardView = await this.LeaderboardView.render();
			homeContainer.appendChild(leaderboardView);
		}, 1800);
	}

	async profileToProfile(pushToStack = true, username) {
		// if (pushToStack) {
		// 	this.backwardStack.push(this.currentView);
		// }

		this.currentView = this.ProfileView;
		const toRemove = document.getElementById("home-container");
		toRemove.remove();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".main-container");
		setTimeout(async () => {
			const profileView = await this.ProfileView.render(username);
			homeContainer.appendChild(profileView);
		}, 300);
	}

	//////////////////////////////////////////////////////////////////////////////////////////

	// async transitionToWaitingRoom(pushToStack = true) {
	async transitionToWaitingRoom(state) {
		// if (pushToStack) {
		// 	this.backwardStack.push(this.currentView);
		// }
		// this.currentView = this.WaitingRoom;
		// const homeContainer = document.getElementById('home-container');
		// const event = new CustomEvent('removeField');
		// window.dispatchEvent(event);
		// this.GridView.animateToWaitingRoom();
		// const appContainer = document.getElementById('app');
		// const homeLayerContainer = appContainer.querySelector('.home-layer-container');
		// const mainContainer = homeLayerContainer.querySelector('.main-container');
		// setTimeout(async () => {
		// 	const waitingRoom = await this.WaitingRoom.render();
		// 	mainContainer.appendChild(waitingRoom);
		// }, this.animationDuration);
		// homeContainer.remove();
	}

	async transitionBackToHome(waiting = false, pushToStack = true) {
		if (this.prevView.name === this.WaitingRoom.name) {
			return;
		}
		if (pushToStack) {
			this.backwardStack.push(this.prevView);
		}
		let toRemove;
		if (this.prevView.name === this.SelectMapView.name) {
			toRemove = document.querySelector(".selectmap-container");
		} else if (this.currentView.name === this.SettingsView.name) {
			toRemove = document.querySelector(".settings-container");
		} else {
			toRemove = document.getElementById("home-container");
		}
		this.currentView = this.HomeView;
		toRemove.remove();

		this.GridView.animateBackHome();

		const appContainer = document.getElementById("app");
		const homeContainer = appContainer.querySelector(".home-layer-container");
		const mainContainer = homeContainer.querySelector(".main-container");
		const homeGrid = homeContainer.querySelector(".home-grid-container");
		homeGrid.style.display = "flex";
		setTimeout(async () => {
			const HomeView = await this.HomeView.render();
			mainContainer.appendChild(HomeView);

			if (waiting === true) {
				setTimeout(() => {
					this.transitionToWaitingRoom();
				}, 500);
			} else {
				const event = new CustomEvent("addField");
				window.dispatchEvent(event);
			}
		}, this.animationDuration);
	}

	async setGridOpacity(opacity) {
		this.GridView.setOpacity(opacity);
	}

	async logout() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/logout/`, {
				credentials: "include",
				method: "POST",
			});

			const data = await response.json();
			if (data.ok === true) {
				this.state.getState().notificationSocket.close();
				this.state.setStateNotify({ currentView: "/sign-in" });
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	removeView() {
		if (this.prevView.name === this.HomeView.name) {
			this.HomeView.remove();
		} else if (this.prevView.name === this.ProfileView.name) {
			this.ProfileView.remove();
		} else if (this.prevView.name === this.LeaderboardView.name) {
			this.LeaderboardView.remove();
		} else if (this.prevView.name === this.TournamentView.name) {
			this.TournamentView.remove();
		} else if (this.prevView.name === this.SelectMapView.name) {
			this.SelectMapView.remove();
		}
	}

	async goBackward(waiting = false) {
		if (this.backwardStack.length > 0) {
			this.prevView = this.currentView;
			this.currentView = this.backwardStack.pop();
			if (this.currentView.name === "HomeView") history.pushState({ page: "/home" }, null, "/home");
			// this.forwardStack.push(this.prevView);
			await this.navigatorHistoryView(waiting);
		}
	}

	async navigatorHistoryView(waiting = false) {
		if (this.currentView === null) {
			return;
		}
		if (this.prevView.name === this.ProfileView.name && this.currentView.name === this.LeaderboardView.name) {
			await this.transitionProfileBackToLeaderboard(false);
		} else if (this.prevView.name === this.SettingsView.name && this.currentView.name === this.ProfileView.name) {
			await this.closeSettings();
		} else if (this.prevView.name === this.ProfileView.name && this.currentView.name === this.ProfileView.name) {
			await this.profileToProfile(false);
		} else if (this.currentView.name === this.HomeView.name) {
			await this.transitionBackToHome(waiting, false);
		} else if (this.currentView.name === this.LeaderboardView.name) {
			await this.transitionToLeaderboard(false);
		} else if (this.currentView.name === this.ProfileView.name) {
			await this.transitionToProfile(false);
		} else if (this.currentView.name === this.SelectMapView.name) {
			await this.transitionToSelectMap(false);
		} else if (this.currentView.name === this.TournamentView.name) {
			await this.transitionToTournament(false);
		}
	}

	setGridView(gridView) {
		this.GridView = gridView;
	}
}
