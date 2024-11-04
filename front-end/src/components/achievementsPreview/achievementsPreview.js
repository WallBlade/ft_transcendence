export default class achievementsPreview {
	constructor(viewController, achievements) {
		this.viewController = viewController;
		this.achievements = achievements;
	}

	loadCss() {
		if (document.getElementById('achievementsPreviewCss')) {
			return;
		}
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'src/components/achievementsPreview/achievementsPreview.css';
		link.type = 'text/css';
		document.head.appendChild(link);
	}

	createBadge(achievementName, src, condition) {
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "badge-container";
        
        const badgeImg = document.createElement("img");
        badgeImg.className = "badge";
        badgeImg.src = src;
        badgeContainer.appendChild(badgeImg);

        if (condition === false) {
            badgeImg.style.filter = "grayscale(100%)";
        }

        const badgeText = document.createElement("span");
        badgeText.textContent = achievementName;
        badgeContainer.appendChild(badgeText);

        return badgeContainer;
    }

    render() {
        this.loadCss();

        const container = document.createElement("div");
        container.className = "achievements";
        
        const achievementsContent = document.createElement("div");
        achievementsContent.className = "achievements-content";
        container.appendChild(achievementsContent);

        achievementsContent.appendChild(this.createBadge("Bully", "../../static/elements/death.png", this.achievements.bully));
        achievementsContent.appendChild(this.createBadge("Flash", "../../static/elements/flash.png", this.achievements.flash));
        achievementsContent.appendChild(this.createBadge("Trophy", "../../static/elements/trophy.png", this.achievements.trophy));
        achievementsContent.appendChild(this.createBadge("Lucky", "../../static/elements/coin.png", this.achievements.lucky));
        achievementsContent.appendChild(this.createBadge("Winner", "../../static/elements/star.png", this.achievements.winner));

        return container;
    }
}