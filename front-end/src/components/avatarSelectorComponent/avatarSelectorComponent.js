export default class AvatarSelectorComponent {
	constructor(players, index) {
		this.players = players;
		this.index = index;
		this.cssPath = "src/components/avatarSelectorComponent/avatarSelectorComponent.css";
		this.selectedAvatar = null;
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

	avatarSelector() {
		this.loadCss();

		let avatar = "";
		let isChoosen = false;
		if (this.players.length === 0) {
			avatar = "../../static/avatars/jack.png";
		} else {
			isChoosen = true;
			avatar = `../../static/avatars/${this.players[this.index].avatar.split("/").pop()}`;
		}
		
		const avatarList = [
			"../../static/avatars/angel.png",
			"../../static/avatars/casper.png",
			"../../static/avatars/cleopatre.png",
			"../../static/avatars/cowbouille.png",
			"../../static/avatars/devil.png",
			"../../static/avatars/dracula.png",
			"../../static/avatars/jack.png",
			"../../static/avatars/king.png",
			"../../static/avatars/knight.png",
			"../../static/avatars/merlin.png",
			"../../static/avatars/paul.png",
			"../../static/avatars/scaph.png",
			"../../static/avatars/witch.png",
		];

		let avatarSelect = Math.floor(avatarList.length / 2);
		this.selectedAvatar = avatarList[avatarSelect].split("/").pop();

		const avatarChooser = document.createElement("div");
		avatarChooser.className = "avatar-chooser";

		const createArrow = (className, isLeft) => {
			const arrow = document.createElement("img");
			arrow.src = "../static/elements/nav_arrow.png";
			arrow.className = className;
			arrow.addEventListener("click", () => updateSelection(isLeft ? -1 : 1));
			avatarChooser.appendChild(arrow);
		};

		if (!isChoosen){
			createArrow("left-arrow-button", true);
		}

		const createAvatarImage = (className) => {
			const img = document.createElement("img");
			img.className = className;
			avatarChooser.appendChild(img);
			return img;
		};

		const avatars = {
			previousPrevious: createAvatarImage("previous-previous-avatar"),
			previous: createAvatarImage("previous-avatar"),
			current: createAvatarImage("current-avatar"),
			next: createAvatarImage("next-avatar"),
			nextNext: createAvatarImage("next-next-avatar"),
		};

		if (!isChoosen) {
			createArrow("right-arrow-button", false);
		}

		const updateAvatarDisplay = () => {
			if (!isChoosen) {
				Object.keys(avatars).forEach((key, index) => {
					const position =
						(avatarSelect + index - 2 + avatarList.length) % avatarList.length;
					avatars[key].src = avatarList[position];
				});
			} else {
				avatars.current.src = avatar;
			}
		};

		const updateSelection = (direction) => {
			avatarSelect =
				(avatarSelect + direction + avatarList.length) % avatarList.length;
			this.selectedAvatar = avatarList[avatarSelect].split("/").pop();
			updateAvatarDisplay();
		};

		updateAvatarDisplay();
		
		return avatarChooser;
	}

	getAvatar() {
		return this.selectedAvatar;
	}
}