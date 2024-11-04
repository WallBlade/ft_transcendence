import boxValue from "../helpers/boxValue";
import { gsap } from "gsap";
import { PRIMARY_COLOR } from "../helpers/colors";

const tlNotifs = gsap.timeline({ paused: true });
const tlFriends = gsap.timeline({ paused: true });
const tl = gsap.timeline({ paused: true });
const tlLeaderboard = gsap.timeline({ paused: true });
const tlSettings = gsap.timeline({ paused: true });

export default class GridView {
    name = 'GridView';
    constructor(viewController) {
        this.viewController = viewController;
        this.cssPath = 'src/styles/home.css';
        this.svg = null;
    }

    loadCss() {
		return new Promise((resolve, reject) => {
			if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
				const cssLink = document.createElement('link');
				cssLink.href = this.cssPath;
				cssLink.rel = 'stylesheet';
				cssLink.type = 'text/css';
				cssLink.onload = resolve;
				cssLink.onerror = reject;
				document.head.appendChild(cssLink);
			} else {
				resolve();
			}
		});
	}

    async render(view) {
        await this.loadCss();

		const container = document.createElement('div');
        container.className = 'home-grid-container';

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", window.innerWidth);
        this.svg.setAttribute("height", window.innerHeight);

        if (view.name === 'HomeView') {
            this.renderHome();
        } else if (view.name === 'LeaderboardView') {
            this.renderLeaderboard();
        } else if (view.name === 'ProfileView') {
            this.renderProfile();
        } else if (view.name === 'TournamentView') {
            this.renderTournament();
        }

        this.profile = this.svg.querySelector('.profile');
        this.leaderboard = this.svg.querySelector('.leaderboard');
        this.tournament = this.svg.querySelector('.tournament');
        this.notifications = this.svg.querySelector('.notifications');
        this.friends = this.svg.querySelector('.friends');
        this.achievements = this.svg.querySelector('.achievements');
        this.selectmap = this.svg.querySelector('.selectmap');
        container.appendChild(this.svg);

        return container;
    }

    renderHome() {
        const home = boxValue.home;

        this.createRect("profile", home['profile'].x, home['profile'].y, home['profile'].width, home['profile'].height);
        this.createRect("leaderboard", home.leaderboard.x, home.leaderboard.y, home.leaderboard.width, home.leaderboard.height);
        this.createRect("tournament", home.tournament.x, home.tournament.y, home.tournament.width, home.tournament.height);
        this.createRect("notifications", home.notifications.x, home.notifications.y, home.notifications.width, home.notifications.height);
        this.createRect("friends", home.friends.x, home.friends.y, home.friends.width, home.friends.height);
        this.createRect("achievements", home.achievements.x, home.achievements.y, home.achievements.width, home.achievements.height);
        this.createRect("selectmap", home.selectmap.x, home.selectmap.y, home.selectmap.width, home.selectmap.height);
    }

    renderLeaderboard() {
        const leaderboard = boxValue.leaderboard;

        this.createRect("tournament", 0, 0, 0, 0);
        this.createRect("friends", 0, 0, 0, 0);
        this.createRect("selectmap", 0, 0, 0, 0);
        this.createRect("profile", leaderboard.first.x, leaderboard.first.y, leaderboard.first.width, leaderboard.first.height);
        this.createRect("leaderboard", leaderboard.list.x, leaderboard.list.y, leaderboard.list.width, leaderboard.list.height);
        this.createRect("notifications", leaderboard.third.x, leaderboard.third.y, leaderboard.third.width, leaderboard.third.height);
        this.createRect("achievements", leaderboard.second.x, leaderboard.second.y, leaderboard.second.width, leaderboard.second.height);
    }

    renderProfile() {
        const profile = boxValue.profile;
    
        this.createRect("leaderboard", 0, 0, 0, 0);
        this.createRect("notifications", 0, 0, 0, 0);
        this.createRect("selectmap", 0, 0, 0, 0);
        this.createRect("achievements", profile.achievements.x, profile.achievements.y, profile.achievements.width, profile.achievements.height);
        this.createRect("profile", profile['profile'].x, profile['profile'].y, profile['profile'].width, profile['profile'].height);
        this.createRect("tournament", profile.history.x, profile.history.y, profile.history.width, profile.history.height);
        this.createRect("friends", profile.friends.x, profile.friends.y, profile.friends.width, profile.friends.height);
    }

    renderTournament() {
        const tournament = boxValue.tournament;

        this.createRect("leaderboard", 0, 0, 0, 0);
        this.createRect("profile", tournament.player1.x, tournament.player1.y, tournament.player1.width, tournament.player1.height);
        this.createRect("notifications", tournament.player4.x, tournament.player4.y, tournament.player4.width, tournament.player4.height);
        this.createRect("selectmap", tournament.map.x, tournament.map.y, tournament.map.width, tournament.map.height);
        this.createRect("achievements", tournament.player3.x, tournament.player3.y, tournament.player3.width, tournament.player3.height);
        this.createRect("tournament", tournament.name.x, tournament.name.y, tournament.name.width, tournament.name.height);
        this.createRect("friends", tournament.player2.x, tournament.player2.y, tournament.player2.width, tournament.player2.height);
    }

    createRect(name, x, y, width, height) {
        let widthPercent = (width / window.innerWidth) * 100;
        let heightPercent = (height / window.innerHeight) * 100;
        let xPercent = (x / window.innerWidth) * 100;
        let yPercent = (y / window.innerHeight) * 100;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", name);
        rect.setAttribute("x", `${xPercent}%`);
        rect.setAttribute("y", `${yPercent}%`);
        rect.setAttribute("width", `${widthPercent}%`);
        rect.setAttribute("height", `${heightPercent}%`);
        rect.setAttribute("rx", '5');
        rect.setAttribute("ry", '5');
        rect.setAttribute("vector-effect", 'non-scaling-stroke');
        rect.setAttribute("fill", 'transparent');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('stroke', PRIMARY_COLOR);

        this.svg.appendChild(rect);
    }

    animateToProfile() {
        const profileBox = boxValue.profile;

        tl.to(this.selectmap, {duration: 0.6, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.leaderboard, {duration: 0.6, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.notifications, {duration: 0.6, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.achievements, {duration: 0.8, ease: "power4.inOut", width: profileBox.achievements.width}, 0)
        .to(this.achievements, {duration: 0.8, ease: "power4.inOut", height: profileBox.achievements.height, y: profileBox.achievements.y - boxValue.home.achievements.y}, 0.2)
        .to(this.friends, {duration: 0.8, ease: "power4.inOut", width: profileBox.friends.width, x: profileBox.friends.x - boxValue.home.friends.x}, 0.2)
        .to(this.friends, {duration: 0.8, ease: "power4.inOut", height: profileBox.friends.height }, 0.4)
        .to(this.tournament, {duration: 0.8, ease: "power4.inOut", x: profileBox.history.x - boxValue.home.tournament.x, width: profileBox.history.width}, 0.2)
        .to(this.tournament, {duration: 0.8, ease: "power4.inOut", height: profileBox.history.height}, 0.6)
        .to(this.profile, {duration: 0.8, ease: "power4.inOut", height: profileBox.profile.height}, 0.2)
        .to(this.profile, {duration: 0.8, ease: "power4.inOut", width: profileBox.profile.width, height: profileBox.profile.height}, 0.4)

        const homeView = this.viewController.HomeView;

        if (homeView.isFriendsOpen) {
            tlFriends.reverse().then(() => {
                tl.play(0, true);
            });
            tlFriends.eventCallback("onReverseComplete", function() {
                tlFriends.clear();
            });
        }
        else {
            tl.play(0, true);
        }

        tl.eventCallback("onComplete", function() {
            tl.clear();
        });
    }

    animateProfileToSettings() {
        const profileBox = boxValue.profile;

        tlSettings
        .to(this.tournament, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.achievements, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.friends, {duration: 0.8, ease: "power4.inOut", opacity: 0}, 0.1)
        .to(this.leaderboard, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.notifications, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.profile, {duration:1, ease: "power4.out", height: profileBox.friends.height}, 0.4)
        .to(this.profile, {duration: 1.2, ease: "power4.out", width: profileBox.achievements.width + profileBox.friends.width + 10}, 0.8)

        tlSettings.play(0, true);

        tlSettings.eventCallback("onReverseComplete", function() {
            tlSettings.clear();
        });
    }
    
    animateToLeaderboard() {
        const leaderboardBox = boxValue.leaderboard;

        tl.to(this.tournament, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.friends, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.selectmap, {duration: 0.5, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.achievements, {duration: 0.8, ease: 'power4.inOut', width: leaderboardBox.second.width}, 0)
        .to(this.notifications, {duration: 0.8, ease: 'power4.inOut', width: leaderboardBox.third.width, x: leaderboardBox.third.x - boxValue.home.notifications.x}, 0)
        .to(this.achievements, {duration: 0.8, ease: 'power4.inOut', height: leaderboardBox.second.height, y: leaderboardBox.second.y - boxValue.home.achievements.y}, 0.3)
        .to(this.notifications, {duration: 0.8, ease: 'power4.inOut', height: leaderboardBox.third.height, y: leaderboardBox.third.y - boxValue.home.notifications.y}, 0.3)
        .to(this.profile, {duration: 0.8, ease: 'power4.inOut', height: leaderboardBox.first.height}, 0)
        .to(this.profile, {duration: 0.8, ease: 'power4.inOut', width: leaderboardBox.first.width}, 0.3)
        .to(this.leaderboard, {duration: 0.8, ease: 'power4.out', y: leaderboardBox.list.y - boxValue.home.leaderboard.y, width: leaderboardBox.list.width, x: leaderboardBox.list.x - boxValue.home.leaderboard.x}, 0.2)
        .to(this.leaderboard, {duration: 0.8, ease: 'power4.inOut', height: leaderboardBox.list.height}, 0.6)
    
        tl.play(0, true);

        tl.eventCallback("onComplete", function() {
            tl.clear();
        });
    }

    animateToTournament() {
        const tournamentBox = boxValue.tournament;

        tl
        .to(this.leaderboard, {duration: 0.4, ease: "power4.out", opacity: 0}, 0.1)
        .to(this.profile, {duration: 0.8, ease: 'power4.inOut', height: tournamentBox.player1.height }, 0.2)
		.to(this.profile, {duration: 0.8, ease: 'power4.inOut', width: tournamentBox.player1.width }, 0.5)
        .to(this.achievements, {duration: 0.8, ease: "power4.out", width: tournamentBox.player3.width}, 0.2)
		.to(this.achievements, {duration: 0.8, ease: "power4.out", height: tournamentBox.player3.height, y: tournamentBox.player3.y - boxValue.home.achievements.y}, 0.6)
        .to(this.tournament, {duration: 0.8, ease: 'power4.inOut', width: tournamentBox.name.width, x: tournamentBox.name.x - boxValue.home.tournament.x}, 0)
        .to(this.tournament, {duration: 0.8, ease: 'power4.inOut', height: tournamentBox.name.height}, 0.5)
        .to(this.selectmap, {duration: 0.8, ease: 'power4.inOut', width: tournamentBox.map.width, x: tournamentBox.map.x - boxValue.home.selectmap.x }, 0.2)
        .to(this.selectmap, {duration: 0.8, ease: 'power4.inOut', height: tournamentBox.map.height, y: tournamentBox.map.y - boxValue.home.selectmap.y}, 0.8)
		.to(this.notifications, {duration: 0.8, ease: "power4.out", width: tournamentBox.player4.width, x: tournamentBox.player4.x - boxValue.home.notifications.x}, 0.5)
		.to(this.notifications, {duration: 0.8, ease: "power4.out", height: tournamentBox.player4.height, y: tournamentBox.player4.y - boxValue.home.notifications.y}, 0.8)
        .to(this.friends, {duration: 0.8, ease: 'power4.inOut', width: tournamentBox.player2.width, x: tournamentBox.player2.x - boxValue.home.friends.x}, 0.8)
        .to(this.friends, {duration: 0.8, ease: 'power4.inOut', height: tournamentBox.player2.height }, 0.7)

        const homeView = this.viewController.HomeView;

        if (homeView.isFriendsOpen) {
            tlFriends.reverse().then(() => {
                tl.play(0, true);
            });
            tlFriends.eventCallback("onReverseComplete", function() {
                tlFriends.clear();
            });
        }
        else {
            tl.play(0, true);
        }

        tl.eventCallback("onComplete", function() {
            tl.clear();
        });
    }

    openFriends() {
        const homeBox = boxValue.home;
		const arrow = document.getElementById('extend-friends');
        const friendsOpenContainer = document.getElementById('friends-open');

        gsap.set(friendsOpenContainer, {opacity: 0});

        tlFriends.to(this.leaderboard, {duration: 0.5, opacity: 0}, 0)
        .to(this.friends, {duration: 1, height: homeBox.friends.height + homeBox['friends-open'].height}, 0)
		.to(arrow, {duration: 1.1, y: homeBox['friends-open'].height}, 0)
		.to(arrow, {duration: 1.1, rotation: '0deg'}, 0.3)
        .to(friendsOpenContainer, {duration: 1.1, opacity: 1}, 0.2);

        tlFriends.play(0, true);

    }
    
    closeFriends() {
        tlFriends.reverse();
        tlFriends.eventCallback("onReverseComplete", function() {
            tlFriends.clear();
        });
    }

    animateToWaitingRoom() {
        const homeBox = boxValue.home;

        tl.to(this.profile, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0)
        .to(this.leaderboard, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.1)
        .to(this.notifications, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.2)
        .to(this.friends, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.3)
        .to(this.tournament, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.4)
        .to(this.achievements, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.5)

        tl.play(0, true);
        tl.eventCallback("onComplete", function() {
            tl.clear();
        });
    }

    animateToSelectMap() {
        const homeBox = boxValue.home;

        tl.to(this.profile, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0)
        .to(this.leaderboard, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.1)
        .to(this.notifications, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.2)
        .to(this.friends, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.3)
        .to(this.tournament, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.4)
        .to(this.achievements, {duration: 0.5, ease: 'power4.out', opacity: 0}, 0.5)
        .to(this.selectmap, {duration: 1.1, ease: 'power4.in', y: -homeBox.selectmap.top, x: -homeBox.selectmap.left}, 0.5)
        .to(this.selectmap, {duration: 1.1, ease: 'power4.in', width: window.innerWidth, height: window.innerHeight}, 0.5)
        .to(this.selectmap, {duration: 1, ease: 'power4.in', opacity: 0}, 0.7)

        tl.play(0, true);

        tl.eventCallback("onComplete", function() {
            tl.clear();
        });
    }

    animateLeaderboardToProfile() {
        const profile = boxValue.profile;
        const leaderboard = boxValue.leaderboard;

        if (Object.keys(boxValue.home).length === 0) {
            tlLeaderboard
            .to(this.profile, {duration: 1, ease: "power4.inOut", width: profile.profile.width}, 0)
            .to(this.profile, {duration: 1, ease: "power4.inOut", height: profile.profile.height}, 0.7)
            .to(this.achievements, {duration: 1, ease: "power4.inOut", height: profile.achievements.height, y: (leaderboard.second.y - window.innerHeight - 19) + profile.achievements.y}, 0.1)
            .to(this.achievements, {duration: 1, ease: "power4.inOut", width: profile.achievements.width}, 1)
            .to(this.notifications, {duration: 1, ease: "power4.inOut", width: profile.history.width, y: (leaderboard.third.y - window.innerHeight - 19) + profile.history.y}, 0.4)
            .to(this.notifications, {duration: 1, ease: "power4.inOut", height: profile.history.height}, 1.1)
            tlLeaderboard.play(0, true);
        } else {
            tlLeaderboard
            .to(this.profile, {duration: 1, ease: "power4.inOut", width: profile.profile.width}, 0)
            .to(this.profile, {duration: 1, ease: "power4.inOut", height: profile.profile.height}, 0.7)
            .to(this.achievements, {duration: 1, ease: "power4.inOut", height: profile.achievements.height, y: profile.achievements.y - boxValue.home.achievements.y}, 0.1)
            .to(this.achievements, {duration: 1, ease: "power4.inOut", width: profile.achievements.width}, 1)
            .to(this.notifications, {duration: 1, ease: "power4.inOut", width: profile.history.width, y: - profile.history.height - 2}, 0.4)
            .to(this.notifications, {duration: 1, ease: "power4.inOut", height: profile.history.height}, 1.1)
            tlLeaderboard.play(0, true);
        }
        tlLeaderboard.eventCallback("onComplete", function() {
            tlLeaderboard.clear();
        });
    }

    setOpacity(opacity) {
        this.svg.style.opacity = opacity;
    }
}
