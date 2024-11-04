import { translation } from "../../js/translate.js";

const ip_address = import.meta.env.VITE_IP_ADDRESS;
export default class friendsComponent {
	constructor(friendsList, username, viewController, isPreview, state) {
		this.language = localStorage.getItem("language") || "en";
		this.isPreview = isPreview;
		this.isFriendsOpen = false;
		this.username = username;
		this.friendsList = friendsList;
		this.viewController = viewController;
		this.state = state;
	}

	loadCss() {
		if (document.getElementById("friendsComponentCss")) {
			return;
		}
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = "src/components/friendsComponent/friendsComponent.css";
		link.type = "text/css";
		document.head.appendChild(link);
	}

	render() {
		this.loadCss();

		const friendsClose = this.friendsClose();

		const friendsOpen = this.friendsOpen();

		return [friendsClose, friendsOpen];
	}

	friendsClose() {
		const container = document.createElement("div");
		container.className = "friends";

		const friendsContent = document.createElement("div");
		friendsContent.className = "friends-content";

		const highlight = document.createElement("img");
		highlight.className = "highlight";
		highlight.src = "../../static/elements/highlight.png";

		friendsContent.appendChild(highlight);

		const header = document.createElement("h2");
		header.textContent = `${translation.friends[this.language]}`;
		header.dataset.translate_inner = "friends";

		friendsContent.appendChild(header);

		const search = document.createElement("input");
		search.className = "friends-search";
		search.id = "friends-search";
		search.placeholder = `${translation.fsearch[this.language]}`;
		search.dataset.translate_placeholder = "fsearch";

		search.addEventListener("keyup", (event) => {
			if (event.key === "Enter") {
				this.addFriend(search.value);
			}
		});

		friendsContent.appendChild(search);

		const buttonsContainer = document.createElement("div");
		buttonsContainer.className = "friends-buttons-container";

		const removeFriend = document.createElement("img");
		removeFriend.className = "button remove-friend";
		removeFriend.src = "../../static/elements/cross.png";

		removeFriend.addEventListener("click", () => {
			search.value = "";
		});

		buttonsContainer.appendChild(removeFriend);
		const addFriend = document.createElement("img");
		addFriend.className = "button add-friend";
		addFriend.src = "../../static/elements/valid.png";

		addFriend.addEventListener("click", () => {
			const friend = search.value;
			this.addFriend(friend);
		});

		buttonsContainer.appendChild(addFriend);
		friendsContent.appendChild(buttonsContainer);

		if (this.isPreview === true) {
			const extendContainer = document.createElement("div");
			extendContainer.className = "extend-container";

			const extendFriend = document.createElement("img");
			extendFriend.className = "extend-friends";
			extendFriend.src = "../../static/elements/nav_arrow.png";
			extendFriend.id = "extend-friends";

			extendContainer.appendChild(extendFriend);
			friendsContent.appendChild(extendContainer);

			extendFriend.addEventListener("click", () => {
				if (!this.isFriendsOpen && this.friendsList.length > 0) {
					this.viewController.transitionToOpenFriends();
					this.isFriendsOpen = true;
				} else if (this.isFriendsOpen) {
					this.viewController.transitionToCloseFriends();
					this.isFriendsOpen = false;
				}
			});
		}

		container.appendChild(friendsContent);

		return container;
	}

	friendsOpen() {
		const friends = document.createElement("div");
		friends.className = "friends-open";
		friends.id = "friends-open";

		for (let key of this.friendsList) {
			const friend = document.createElement("div");
			friend.className = "profile-friend";

			const profileContainer = document.createElement("div");
			profileContainer.className = "profile-name-image-container";
			friend.appendChild(profileContainer);

			const avatar = document.createElement("img");
			avatar.src = `https://${ip_address}:8000/media/${key.profile_picture}`;
			avatar.className = "profile-avatar";
			profileContainer.appendChild(avatar);

			const name = document.createElement("span");
			name.textContent = key.username;
			name.className = "friend-name";
			profileContainer.appendChild(name);

			const onlineStatus = document.createElement("div");
			onlineStatus.className = "user-status";
			onlineStatus.id = key.username;
			onlineStatus.classList.add(key.status);
			profileContainer.appendChild(onlineStatus);

			const scoreContainer = document.createElement("div");
			scoreContainer.className = "profile-score-container";
			friend.appendChild(scoreContainer);

			const score = document.createElement("span");
			score.textContent = key.score;
			score.className = "profile-score";
			scoreContainer.appendChild(score);

			const trophy = document.createElement("img");
			trophy.src = "../../static/elements/trophy.png";
			trophy.className = "profile-avatar";
			scoreContainer.appendChild(trophy);

			const interactContainer = document.createElement("div");
			interactContainer.className = "interact-container";
			friend.appendChild(interactContainer);

			const invite = document.createElement("span");
			invite.textContent = `${translation.challenge[this.language]}`;
			invite.dataset.translate_inner = "challenge";
			invite.style.cursor = "pointer";

			invite.addEventListener("click", (e) => {
				this.challengeFriend(key.username);
			});

			interactContainer.appendChild(invite);
			const inspect = document.createElement("img");
			inspect.src = "../../static/elements/lens.png";
			inspect.className = "inspect";
			inspect.style.cursor = "pointer";
			inspect.addEventListener("click", (e) => {
				if (this.isPreview === true) {
					this.viewController.transitionToProfile(true, key.username);
				} else {
					this.viewController.profileToProfile(true, key.username);
				}
			});
			interactContainer.appendChild(inspect);
			friends.appendChild(friend);
		}

		window.requestAnimationFrame(() => {
			if (friends.scrollHeight > friends.clientHeight) {
				friends.classList.add("overflowing");
			}
		});

		return friends;
	}

	async addFriend(friend) {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/friend/`, {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					user: this.username,
					friend: friend,
				}),
			});

			const data = await response.json();
			const friendBox = document.getElementById("friends-search");
			if (response.ok === true) {
				friendBox.value = "";
				friendBox.placeholder = `${translation.fadded[this.language]}`;
				friendBox.style.border = "1px solid green";
			} else {
				friendBox.value = "";
				friendBox.placeholder = `${translation.fnotfound[this.language]}`;
				friendBox.style.border = "1px solid red";
			}
		} catch (error) {
			console.error("Error:", error.message);
		}
	}

	async challengeFriend(friend) {
		try {
			const response = await fetch(`https://${ip_address}:8000/api/game_invitation/`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					receiver: friend,
				}),
			});
			
			const data = await response.json();

			if (!data.ok) {
				// console.log('Error:', data.message);
			} else {
				if (data.ok && this.state) {
					this.state.setState({isInWaitingRoom: true});
					this.state.setState({gameData: {host: this.username, opponent: friend}});
					this.state.setStateNotify({currentView: "/waiting-room"})
				} else {
					// console.log('Failed to send game invitation.')
				}
			} 
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}
}
