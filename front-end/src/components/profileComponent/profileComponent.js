import enumProfileView from "../../helpers/enumProfileView";
import { translation } from "../../js/translate.js";

const ip_address = import.meta.env.VITE_IP_ADDRESS;

export default class ProfileComponent {
	constructor(user, viewController, profileView, state) {
		this.language = localStorage.getItem("language") || "en";
		this.onlineStatus = user.status;
		this.userStats = user.stats;
		this.viewController = viewController;
		this.username = user.username;
		this.score = user.score;
		this.profilePicture = user.profile_picture;
		this.profileView = profileView;
		this.friendsList = user.friends;
		this.state = state;
		this.cssPath = "src/components/profileComponent/profileComponent.css";
	}

	loadCss() {
		if (document.querySelector(`link[href="${this.cssPath}"]`)) {
			return;
		}
		const link = document.createElement("link");
		link.href = this.cssPath;
		link.rel = "stylesheet";
		link.type = "text/css";
		document.head.appendChild(link);
	}

	render() {
		this.loadCss();

		const container = document.createElement("div");
		container.className = "profile";

		const profileContent = document.createElement("div");
		profileContent.className = "profile-content";
		container.appendChild(profileContent);

		const headerContainer = document.createElement("div");
		headerContainer.className = "header-container";
		profileContent.appendChild(headerContainer);

		const header = document.createElement("h2");
		header.textContent = `${this.username}`;
		headerContainer.appendChild(header);

		if (this.profileView === enumProfileView.PUBLIC_PROFILE) {
			const onlineStatus = document.createElement("div");
			onlineStatus.className = "user-status";
			onlineStatus.id = this.username;
			onlineStatus.classList.add(this.onlineStatus);
			headerContainer.appendChild(onlineStatus);
		}

		const profilePicture = document.createElement("img");
		profilePicture.src = `https://${ip_address}:8000/media/${this.profilePicture}`;
		profilePicture.className = "profile-picture";
		profileContent.appendChild(profilePicture);

		const statsContainer = document.createElement("div");
		statsContainer.className = "stats-container";
		profileContent.appendChild(statsContainer);

		const totalWinsWrapper = document.createElement("div");
		totalWinsWrapper.className = "stat-wrapper";
		statsContainer.appendChild(totalWinsWrapper);

		const totalWins = document.createElement("span");
		totalWins.className = "stat";
		totalWins.textContent = this.userStats.total_wins;
		totalWinsWrapper.appendChild(totalWins);

		const totalWinsLabel = document.createElement("span");
		totalWinsLabel.className = "stat-label";
		totalWinsLabel.textContent = `${translation.wins[this.language]}`;
		totalWinsLabel.dataset.translate_inner = "wins";
		totalWinsWrapper.appendChild(totalWinsLabel);

		const totalLossesWrapper = document.createElement("div");
		totalLossesWrapper.className = "stat-wrapper";
		statsContainer.appendChild(totalLossesWrapper);

		const totalLosses = document.createElement("span");
		totalLosses.className = "stat";
		totalLosses.textContent = this.userStats.total_loses;
		totalLossesWrapper.appendChild(totalLosses);

		const totalLossesLabel = document.createElement("span");
		totalLossesLabel.className = "stat-label";
		totalLossesLabel.textContent = `${translation.losses[this.language]}`;
		totalLossesLabel.dataset.translate_inner = "losses";
		totalLossesWrapper.appendChild(totalLossesLabel);

		const winRateWrapper = document.createElement("div");
		winRateWrapper.className = "stat-wrapper";
		statsContainer.appendChild(winRateWrapper);

		const winRate = document.createElement("span");
		winRate.className = "stat ratio";
		winRate.textContent = this.userStats.winrate + "%";
		winRateWrapper.appendChild(winRate);

		const winRateLabel = document.createElement("span");
		winRateLabel.className = "stat-label";
		winRateLabel.textContent = `${translation.winrate[this.language]}`;
		winRateLabel.dataset.translate_inner = "winrate";
		winRateWrapper.appendChild(winRateLabel);

		const scoredGoalsWrapper = document.createElement("div");
		scoredGoalsWrapper.className = "stat-wrapper";
		statsContainer.appendChild(scoredGoalsWrapper);

		const scoredGoals = document.createElement("span");
		scoredGoals.className = "stat";
		scoredGoals.textContent = this.userStats.total_goals;
		scoredGoalsWrapper.appendChild(scoredGoals);

		const scoredGoalsLabel = document.createElement("span");
		scoredGoalsLabel.className = "stat-label";
		scoredGoalsLabel.textContent = `${translation.goals[this.language]}`;
		scoredGoalsLabel.dataset.translate_inner = "goals";
		scoredGoalsWrapper.appendChild(scoredGoalsLabel);

		const takenGoalsWrapper = document.createElement("div");
		takenGoalsWrapper.className = "stat-wrapper";
		statsContainer.appendChild(takenGoalsWrapper);

		const takenGoals = document.createElement("span");
		takenGoals.className = "stat";
		takenGoals.textContent = this.userStats.total_goals_taken;
		takenGoalsWrapper.appendChild(takenGoals);

		const takenGoalsLabel = document.createElement("span");
		takenGoalsLabel.className = "stat-label";
		takenGoalsLabel.textContent = `${translation.concede[this.language]}`;
		takenGoalsLabel.dataset.translate_inner = "concede";
		takenGoalsWrapper.appendChild(takenGoalsLabel);

		const goalsRatioWrapper = document.createElement("div");
		goalsRatioWrapper.className = "stat-wrapper";
		statsContainer.appendChild(goalsRatioWrapper);

		const goalsRatio = document.createElement("span");
		goalsRatio.className = "stat ratio";
		goalsRatio.textContent = this.userStats.ratio;
		goalsRatioWrapper.appendChild(goalsRatio);

		const goalsRatioLabel = document.createElement("span");
		goalsRatioLabel.className = "stat-label";
		goalsRatioLabel.textContent = "Ratio";
		goalsRatioWrapper.appendChild(goalsRatioLabel);

		if (this.profileView === enumProfileView.HOME_PROFILE) {
			const inspectButton = this.createButton("Inspect");
			profileContent.appendChild(inspectButton);
			inspectButton.addEventListener("click", () => {
				this.viewController.transitionToProfile();
			});
		} else if (this.profileView === enumProfileView.PRIVATE_PROFILE) {
			const inspectButton = this.createButton("Settings");
			profileContent.appendChild(inspectButton);
			inspectButton.addEventListener("click", () => {
				this.viewController.goToSettings();
			});
		} else if (this.profileView === enumProfileView.PUBLIC_PROFILE) {
			const inspectButton = this.createButton("Challenge");
			profileContent.appendChild(inspectButton);
			inspectButton.addEventListener("click", () => {
				this.challengeFriend(this.username);
			});
		}

		return container;
	}

	createButton(textContent) {
		const button = document.createElement("button");
		button.className = "profile-button";

		const inspect = document.createElement("span");
		inspect.className = "classic";
		inspect.textContent = `${translation[textContent.toLowerCase()][this.language]}`;
		inspect.dataset.translate_inner = textContent.toLowerCase();
		button.appendChild(inspect);

		if (this.profileView === enumProfileView.HOME_PROFILE) {
			const inspectIcon = document.createElement("img");
			inspectIcon.src = "../../static/elements/lens.png";
			inspectIcon.className = "inspect-icon";
			button.appendChild(inspectIcon);
		}
		return button;
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
				console.log('Error:', data.message);
			} else {
				if (data.ok && this.state) {
					console.log('Game invitation sent successfully.')
					this.state.setState({isInWaitingRoom: true});
					this.state.setState({gameData: {host: this.state.getState().username, opponent: friend}});
					this.state.setStateNotify({currentView: "/waiting-room"})
				} else {
					console.log('Failed to send game invitation.')
				}
			} 
		} catch (error) {
			console.error("Fetch Error:", error);
		}
	}
}
