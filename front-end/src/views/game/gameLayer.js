import PreGameView from "./preGameView";
import GameView from "./GameView";
import AfterGameView from "./AfterGameView";
import GameViewController from "../ViewControllerGame.js";
import {createTournamentBracket, getFinalPlayers} from "../../js/tournament_logic";
const ip_address = import.meta.env.VITE_IP_ADDRESS;

export default class GameLayer {
    constructor(state, type) {
		this.state = state;
        this.cssPath = 'src/styles/game.css';
        this.viewController = new GameViewController();
        this.type = type;

        this.username = null; // TO CHANGE
        this.opponent = null;
        this.difficulty = null;
        this.gameId = null;

        this.gameOver = this.gameOver.bind(this);
    }

    loadCss() {
        if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
            const cssLink = document.createElement('link');
            cssLink.href = this.cssPath;
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            document.head.appendChild(cssLink);
        }
    }

    async render() {
        this.loadCss();
        await this.fetchUserData();
        
        const rootDiv = document.getElementById("app");
		rootDiv.innerHTML = '';

        this.difficulty = sessionStorage.getItem('difficulty');

		if (this.difficulty) {
            this.difficulty = JSON.parse(this.difficulty);
        }
        if (this.type === 'online') {
            await this.fetchOpponentData();
            await this.fetchHostData();
        }
        if (this.type === 'ia' || this.type === 'online' && this.state.getState().gameHost.username === this.username)
            await this.startGameApi();

		this.container = document.createElement('div');
        this.container.className = 'game-layer-container';

		
        const preGameView = new PreGameView(this.type, this.username, this.difficulty, this.state);
        this.container.appendChild(await preGameView.render());
        const gameView = new GameView(this);
        this.container.appendChild(gameView.render());

        this.viewController.transitionToGame();

        // document.addEventListener('game-over', this.gameOver.bind(this));
    
        return this.container;
    }

    async gameOver(score1, score2) {
        const afterGameView = new AfterGameView(this.type, score1, score2, this.username, this.difficulty, this.state);
        this.container.appendChild(await afterGameView.render());
        if (this.state.getState().gameSocket)/*  console.log("Game socket exists"); */
        if (this.state.getState().gameSocket.readyState !== this.state.getState().gameSocket.OPEN) {
            // console.log("TTETETETETE");
        }
        if (this.type === 'ia' || (this.type === 'online' && 
            (this.state.getState().gameHost.username === this.username || this.state.getState().gameSocket.readyState !== this.state.getState().gameSocket.OPEN))) {
            await this.endGameApi(score1, score2);
        }
        setTimeout(() => {
            if (this.type === 'tournament') {
                this.state.setStateNotify({ currentView: '/tournament' });
            } else {
                this.state.setStateNotify({ currentView: '/home' });
            }
        }, 4000);
    }
 
    async fetchUserData() {
		const apiPath = `https://${ip_address}:8000/api/profile/`;
		try {
			const response = await fetch(`${apiPath}`, {
				method: 'GET',
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok === true) {
				this.username = data.user.username;
                this.state.setState({ gameUser: data.user });
			}
		} catch (error) {
			console.error('Error:', error);
		}
    }

    async fetchOpponentData() {
		const apiPath = `https://${ip_address}:8000/api/profile/${this.state.getState().gameData.opponent}/`;
		try {
			const response = await fetch(`${apiPath}`, {
				method: 'GET',
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok === true) {
                this.state.setState({ gameOpponent: data.user });
			}
		} catch (error) {
			console.error('Error:', error);
		}
    }

    async fetchHostData() {
		const apiPath = `https://${ip_address}:8000/api/profile/${this.state.getState().gameData.host}/`;
		try {
			const response = await fetch(`${apiPath}`, {
				method: 'GET',
				credentials: "include",
			});

			const data = await response.json();
			if (response.ok === true) {
                this.state.setState({ gameHost: data.user });
			}
		} catch (error) {
			console.error('Error:', error);
		}
    }

    async startGameApi() {
        let players;

        if (this.type === 'ia') {
            players = {player1: `AI_${this.difficulty}`, player2: this.username};
        } else if (this.type === 'online') {
            players = {player1: this.state.getState().gameHost.username, player2: this.state.getState().gameOpponent.username};
        }

        const apiPath = `https://${ip_address}:8000/api/game/`;
        try {
			const response = await fetch(`${apiPath}`, {
                method: "POST",
				credentials: "include",
				body: JSON.stringify({
					player1: players.player1,
                    player2: players.player2,
			    }),
            });
			const data = await response.json();
			if (response.ok === true) {
				this.gameId = data.game_id;
                this.state.setState({gameID: data.game_id});
			}
		} catch (error) {
			console.error('Error:', error.message);
		}
    }

    async endGameApi(score1, score2) {
        if (this.state.getState().gameId)
            this.gameId = this.state.getState().gameId;
        if (this.type !== 'ia' && this.state.getState().gameStopped === false && this.username !== this.state.getState().gameHost.username) {
            return ;
        }
        const apiPath = `https://${ip_address}:8000/api/game/${this.gameId}/`;
        let winner;
        if (this.type === 'ia') {
            winner = score1 < score2 ? this.username : `AI_${this.difficulty}`;
        } else if (this.type === 'online') {
            if (this.state.getState().gameSocket.readyState !== this.state.getState().gameSocket.OPEN) {
                winner = this.username;
            } else {
                winner = score1 < score2 ? this.state.getState().gameOpponent.username :  this.state.getState().gameHost.username;
            }
        }
        try {
			const response = await fetch(`${apiPath}`, {
                method: "PATCH",
				credentials: "include",
				body: JSON.stringify({
					winner: winner,
					score_player1: score1,
                    score_player2: score2,
			    }),
            });
            this.state.setState({gameId: null});
			const data = await response.json();
		} catch (error) {
			console.error('Error:', error);
		}
    }
}