import { gsap } from "gsap";
import { translation } from "../../js/translate.js";

const ip_address = import.meta.env.VITE_IP_ADDRESS;

export default class notificationsComponent {
	constructor(viewController, state, username) {
		this.viewController = viewController;
		this.isNotificationsOpen = false;
		this.notificationList = [];
		this.latestNotification = null;
		this.state = state;
		this.username = username;
	}

	loadCss() {
		if (document.getElementById("notificationsComponentCss")) {
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = "src/components/notificationsComponent/notificationsComponent.css";
		link.type = "text/css";
		document.head.appendChild(link);
	}

	async notifications() {
		this.notificationList = [];
		this.notificationList = await this.getNotifications();

		const container = document.createElement("div");
		container.className = "notifications";
		container.id = "notifications-container";

		const notificationsContent = document.createElement("div");
		notificationsContent.className = "notifications-content";

		const highlight = document.createElement("img");
		highlight.className = "highlight";
		highlight.src = "../../static/elements/lowlight.png";
		container.appendChild(highlight);

		const header = document.createElement("h2");
		header.textContent = "Notifs";

		notificationsContent.appendChild(header);

		const separator = document.createElement("hr");
		notificationsContent.appendChild(separator);

		container.appendChild(notificationsContent);

		this.latestNotification = document.createElement("div");
		this.latestNotification.className = "latest-notification-container";
		this.latestNotification.id = "latest-notification";
		notificationsContent.appendChild(this.latestNotification);

		setTimeout(() => {
			if (this.notificationList.length > 0) {
				this.createNotification(this.notificationList[0].type);
			} else {
				const noNotification = document.createElement("span");
				noNotification.className = "no-notification";
				noNotification.textContent = `${translation.notification[localStorage.getItem("language") || "en"]}`;
				noNotification.dataset.translate_inner = "notification";
				this.latestNotification.appendChild(noNotification);
			}
		}, 100);
		return container;
	}

	async receiveNotifications(newNotification, type = "friend_request") {
		if (newNotification) {
			await gsap.to(this.latestNotification, { duration: 0.5, opacity: 0, x: -25 }).then(() => {
				this.notificationList.unshift(newNotification);
				this.latestNotification.innerHTML = "";
			});
			this.createNotification(type);
		}
	}

	async createNotification(type) {
		const notification = document.createElement("span");
		notification.className = "notification";

		if (type === "friend_request") {
			// console.log(localStorage.getItem("language") || "en");
			notification.textContent = `${translation.friendRequest[localStorage.getItem("language") || "en"]}`;
			notification.dataset.translate_inner = "friendRequest";
		} else if (type === "game_invitation") {
			notification.textContent = `${translation.gameRequest[localStorage.getItem("language") || "en"]}`;
			notification.dataset.translate_inner = "gameRequest";
		}

		notification.textContent += ` ${this.notificationList[0].user} !`;
		this.latestNotification.appendChild(notification);

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "notif-buttons-container";
		this.latestNotification.appendChild(buttonsContainer);

		const acceptButton = document.createElement("button");
		acceptButton.className = "notif-button accept";
		acceptButton.textContent = "Accept";
		acceptButton.addEventListener("click", async () => {
			await this.handleRequest(this.notificationList[0], "validated", type);
		});
		buttonsContainer.appendChild(acceptButton);

		const declineButton = document.createElement("button");
		declineButton.className = "notif-button decline";
		declineButton.textContent = "Decline";
		declineButton.addEventListener("click", async () => {
			await this.handleRequest(this.notificationList[0], "declined", type);
		});
		buttonsContainer.appendChild(declineButton);

		gsap.set(this.latestNotification, { opacity: 0, x: 25 });
		gsap.to(this.latestNotification, { duration: 0.5, opacity: 1, x: 0 });
	}

	async updateNotifications(errorMessage = "") {
		const timeline = gsap.timeline({ paused: true });

		const buttonsContainer = document.querySelector(".notif-buttons-container");

		timeline
			.to(
				this.latestNotification,
				{
					duration: 1,
					opacity: 0,
					x: 25,
					onComplete: () => {
						this.latestNotification.innerHTML = "";
						this.notificationList.shift();
					},
				},
				0
			)
			.add(() => {
				if (errorMessage) {
					const errorNotification = document.createElement("span");
					errorNotification.className = "notification error-notification";
					errorNotification.textContent = errorMessage;
					this.latestNotification.appendChild(errorNotification);
				}
			})
			.to(this.latestNotification, {
				duration: errorMessage === "" ? 0 : 1,
				opacity: 1,
				x: 0,
			})
			.to(this.latestNotification, {
				duration: errorMessage === "" ? 0 : 1,
				opacity: 0,
				x: 25,
				onComplete: () => {
					if (errorMessage) {
						this.latestNotification.innerHTML = "";
					}
				},
			})
			.add(() => {
				if (this.notificationList.length > 0) {
					this.receiveNotifications(this.notificationList[0], this.notificationList[0].type);
				} else {
					const noNotification = document.createElement("span");
					noNotification.className = "no-notification";
					noNotification.textContent = "You have no notifications.";
					this.latestNotification.appendChild(noNotification);
				}
			})
			.to(this.latestNotification, {
				duration: 0.5,
				opacity: 1,
				x: 0,
			});

		await timeline.play();
	}

	async getNotifications() {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/notifications_list/`, {
				method: "GET",
				credentials: "include",
			});

			const data = await response.json();
			return data.notifications_list;
		} catch (error) {
			console.error(error);
		}
	}

	async handleRequest(request, action, type) {
		if (type === "friend_request") {
			this.handleFriendRequest(request.id, action);
		} else if (type === "game_invitation") {
			this.handleGameRequest(request, action);
		} 
	}

	async handleFriendRequest(requestId, action) {
		const status = action === "validated" ? "ACCEPTED" : "REJECTED";
		try {
			const response = await fetch(`https://${ip_address}:8000/api/friend/${requestId}/`, {
				method: "PATCH",
				credentials: "include",
				body: JSON.stringify({
					status: status,
				}),
			});

			const data = await response.json().then(() => {
				this.updateNotifications();
			});
		} catch (error) {
			console.error(error);
		}
	}

	async handleGameRequest(request, action) {
		const status = action === "validated" ? "ACCEPTED" : "REJECTED";
		try {
			const response = await fetch(`https://${ip_address}:8000/api/game_invitation/${request.id}/`, {
				method: "PATCH",
				credentials: "include",
				body: JSON.stringify({
					status: status,
				}),
			});

			const data = await response.json()
			
			if (data.message === "Game invitation is not pending")
				this.updateNotifications(`${translation.cancelled[localStorage.getItem("language") || "en"]}`);
			else if (data.message === "Sender is offline") {
				this.updateNotifications(`${translation.senderoffline[localStorage.getItem("language") || "en"]}`);
			} else {
				this.updateNotifications();
			}
			if (action === "validated" && data.ok) {
				this.state.setState({gameData: {host: request.user, opponent: this.username}});
				this.state.setStateNotify({currentView: "/game-online"});
			}
		} catch (error) {
			console.error(error);
		}
	}
}
