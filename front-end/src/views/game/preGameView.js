const ip_address = import.meta.env.VITE_IP_ADDRESS;

export default class PreGameView {
    constructor(type, username, difficulty, state) {
        this.type = type;
        this.username = username;
        this.difficulty = difficulty;
        this.state = state;
    }

    async render() {
        if (this.type === 'ia' || this.type === 'local') {
            return (this.localRender());
        }
		else if (this.type === 'online') {
			return (this.onlineRender());
		}
        else if (this.type === 'tournament') {
            return (this.localRenderTournament());
        }
    }

    localRender() {
        const user = this.state.getState().gameUser;
        const versusContainer = document.createElement('div');
        versusContainer.id = 'versus-container';
        versusContainer.className = 'versus-container';

        const Player1Container = document.createElement('div');
        Player1Container.className = 'game-player-container';
        Player1Container.id = 'player2';
        const player1Title = document.createElement('h2');
        player1Title.innerText = this.type === 'ia' ? 'AI' : 'Invited';
        Player1Container.appendChild(player1Title);
        const player1Avatar = document.createElement('img');
        if (this.type === 'ia' && this.difficulty === 'easy') {
            player1Avatar.src = '../../static/avatars/baby.png';
        } else if (this.type == 'ia' && this.difficulty === 'medium') {
            player1Avatar.src = '../../static/avatars/alien.png';
        } else if (this.type == 'ia' && this.difficulty === 'hard') {
            player1Avatar.src = '../../static/avatars/demon.png';
        } else if (this.type === 'local') {
            player1Avatar.src = '../../static/avatars/baby.png';
        }
        player1Avatar.className = 'pregame-avatar';
        Player1Container.appendChild(player1Avatar);
        versusContainer.appendChild(Player1Container);

        const separatorImg = document.createElement('img');
        separatorImg.id = 'separator';
        separatorImg.src = '../../static/elements/flash.png';
        separatorImg.className = 'separator';
        versusContainer.appendChild(separatorImg);

        const Player2Container = document.createElement('div');
        Player2Container.className = 'game-player-container';
        Player2Container.id = 'player1';
        const player2Title = document.createElement('h2');
        player2Title.innerText = user.username;
        Player2Container.appendChild(player2Title);
        const player2Avatar = document.createElement('img');
        player2Avatar.src = `https://${ip_address}:8000/media/${user.profile_picture}`;
        player2Avatar.className = 'pregame-avatar';
        Player2Container.appendChild(player2Avatar);
        versusContainer.appendChild(Player2Container);

        return versusContainer;
    }

    localRenderTournament() {
        const match = JSON.parse(sessionStorage.getItem('match'));
        if (!match) {
            console.error("Match not set in session storage.");
            return;
        }
        const versusContainer = document.createElement('div');
        versusContainer.id = 'versus-container';
        versusContainer.className = 'versus-container';

        const Player1Container = document.createElement('div');
        Player1Container.className = 'game-player-container';
        Player1Container.id = 'player1'
        const player1Title = document.createElement('h2');
        player1Title.innerText = match.player1.alias;
        Player1Container.appendChild(player1Title);
        const player1Avatar = document.createElement('img');
        player1Avatar.src = match.player1.avatar;
        player1Avatar.className = 'pregame-avatar';
        Player1Container.appendChild(player1Avatar);
        versusContainer.appendChild(Player1Container);

        const separatorImg = document.createElement('img');
        separatorImg.id = 'separator';
        separatorImg.src = '../../static/elements/flash.png';
        separatorImg.className = 'separator';
        versusContainer.appendChild(separatorImg);

        const Player2Container = document.createElement('div');
        Player2Container.className = 'game-player-container';
        Player2Container.id = 'player2';
        const player2Title = document.createElement('h2');
        player2Title.innerText = match.player2.alias;
        Player2Container.appendChild(player2Title);
        const player2Avatar = document.createElement('img');
        player2Avatar.src = match.player2.avatar;
        player2Avatar.className = 'pregame-avatar';
        Player2Container.appendChild(player2Avatar);
        versusContainer.appendChild(Player2Container);

        return versusContainer;
    }

	// to complete with player2 info to fetch once invite is sent to join the game

	onlineRender() {
        let host = {
            username : this.state.getState().gameHost.username,
            avatar : this.state.getState().gameHost.profile_picture
        }

        let opponent = {
            username : this.state.getState().gameOpponent.username,
            avatar : this.state.getState().gameOpponent.profile_picture
        }

		const versusContainer = document.createElement('div');
		versusContainer.id = 'versus-container';
		versusContainer.className = 'versus-container';

		const secondPlayerContainer = document.createElement('div');
		secondPlayerContainer.className = 'game-player-container';
		secondPlayerContainer.id = 'player1';
		const playerTwoTitle = document.createElement('h2');
		playerTwoTitle.innerText = opponent.username;
		secondPlayerContainer.appendChild(playerTwoTitle);
		const playerTwoAvatar = document.createElement('img');
		playerTwoAvatar.src = `https://${ip_address}:8000/media/${opponent.avatar}`;
		playerTwoAvatar.className = 'pregame-avatar';
		secondPlayerContainer.appendChild(playerTwoAvatar);
		versusContainer.appendChild(secondPlayerContainer);

		const separatorImg = document.createElement('img');
		separatorImg.id = 'separator';
		separatorImg.src = '../../static/elements/flash.png';
		separatorImg.className = 'separator';
		versusContainer.appendChild(separatorImg);

		const firstPlayerContainer = document.createElement('div');
		firstPlayerContainer.className = 'game-player-container';
		firstPlayerContainer.id = 'player2';
		const playerOneTitle = document.createElement('h2');
		playerOneTitle.innerText = host.username;
		firstPlayerContainer.appendChild(playerOneTitle);
		const playerOneAvatar = document.createElement('img');
		playerOneAvatar.src = `https://${ip_address}:8000/media/${host.avatar}`;
		playerOneAvatar.className = 'pregame-avatar';
		firstPlayerContainer.appendChild(playerOneAvatar);
		versusContainer.appendChild(firstPlayerContainer);

		return versusContainer;
	}
}