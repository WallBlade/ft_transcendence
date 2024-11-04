const ip_address = import.meta.env.VITE_IP_ADDRESS;
export default class AfterGameView {
    constructor(type, score1, score2, username, difficulty, state) {
        this.type = type;
        this.score1 = score1;
        this.score2 = score2;
        this.username = username;
        this.difficulty = difficulty;
        this.state = state;
    }

    async render() {
        if (this.type === 'ia' || this.type === 'local') {
            return (this.localRender());
        }
        if (this.type === 'tournament') {
            return (this.localRenderTournament());
        }
        if (this.type === 'online') {
            return (this.onlineRender());
        }
    }

    localRender() {
        const versusContainer = document.createElement('div');
        versusContainer.id = 'versus-container';
        versusContainer.className = 'versus-container';

        const Player1Container = document.createElement('div');
        Player1Container.className = 'game-player-container';
        const player1Title = document.createElement('h2');
        player1Title.innerText = this.type === 'ia' ? 'AI' : 'Player 2';
        Player1Container.appendChild(player1Title);
        const player1Avatar = document.createElement('img');
        player1Avatar.src = '../../static/avatars/scaph.png';
        player1Avatar.className = 'avatar';
        const player1Score = document.createElement('span');
        player1Score.innerText = this.score1;
        player1Score.className = 'score';
        Player1Container.appendChild(player1Score);
        versusContainer.appendChild(Player1Container);

        const separatorImg = document.createElement('img');
        separatorImg.src = '../../static/elements/flash.png';
        separatorImg.className = 'separator';
        versusContainer.appendChild(separatorImg);

        const Player2Container = document.createElement('div');
        Player2Container.className = 'game-player-container';
        const player2Title = document.createElement('h2');
        player2Title.innerText = this.username;
        Player2Container.appendChild(player2Title);
        const player2Avatar = document.createElement('img');
        player2Avatar.src = '../../static/avatars/angel.png';
        player2Avatar.className = 'avatar';
        const player2Score = document.createElement('span');
        player2Score.innerText = this.score2;
        player2Score.className = 'score';
        Player2Container.appendChild(player2Score);
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
        const player1Title = document.createElement('h2');
        player1Title.innerText = match.player1.alias;
        Player1Container.appendChild(player1Title);
        const player1Avatar = document.createElement('img');
        player1Avatar.src = match.player1.avatar;
        player1Avatar.className = 'avatar';
        const player1Score = document.createElement('span');
        player1Score.innerText = this.score1;
        player1Score.className = 'score';
        Player1Container.appendChild(player1Score);
        versusContainer.appendChild(Player1Container);

        const separatorImg = document.createElement('img');
        separatorImg.src = '../../static/elements/flash.png';
        separatorImg.className = 'separator';
        versusContainer.appendChild(separatorImg);

        const Player2Container = document.createElement('div');
        Player2Container.className = 'game-player-container';
        const player2Title = document.createElement('h2');
        player2Title.innerText = match.player2.alias;
        Player2Container.appendChild(player2Title);
        const player2Avatar = document.createElement('img');
        player2Avatar.src = match.player2.avatar;
        player2Avatar.className = 'avatar';
        const player2Score = document.createElement('span');
        player2Score.innerText = this.score2;
        player2Score.className = 'score';
        Player2Container.appendChild(player2Score);
        versusContainer.appendChild(Player2Container);
        
        const results = JSON.parse(sessionStorage.getItem('results'));
        const winner = this.score1 > this.score2 ? match.player1.alias : match.player2.alias;
        const loser = this.score1 < this.score2 ? match.player1.alias : match.player2.alias;
        if (!results.some(result => result.stage === 'semiFinal1')) {
            const semiFinal1 = {stage: 'semiFinal1', winner: this.score1 > this.score2 ? match.player1.alias : match.player2.alias,
                loser: this.score1 < this.score2 ? match.player1.alias : match.player2.alias, 
                score: {score1: this.score1, score2: this.score2}};
            results.push(semiFinal1);
            sessionStorage.setItem('results', JSON.stringify(results));
        }
        else if (!results.some(result => result.stage === 'semiFinal2')) {
            const semiFinal2 = {stage: 'semiFinal2', winner: winner, 
                loser: loser,
                score: {score1: this.score1, score2: this.score2}};
            results.push(semiFinal2);
            sessionStorage.setItem('results', JSON.stringify(results));
        }
        else if (!results.some(result => result.stage === 'final')) {
            const final = {stage: 'final', winner: winner,
                loser: loser,
                score: {score1: this.score1, score2: this.score2}};
            results.push(final);
            sessionStorage.setItem('results', JSON.stringify(results));
        }
        return versusContainer;
    }

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

        const Player1Container = document.createElement('div');
        Player1Container.className = 'game-player-container';
        const player1Title = document.createElement('h2');
        player1Title.innerText = host.username;
        Player1Container.appendChild(player1Title);
        const player1Avatar = document.createElement('img');
        player1Avatar.src = `https://${ip_address}:8000/media/${host.avatar}`;
        player1Avatar.className = 'avatar';
        const player1Score = document.createElement('span');
        player1Score.innerText = this.score1;
        player1Score.className = 'score';
        Player1Container.appendChild(player1Score);
        versusContainer.appendChild(Player1Container);

        const separatorImg = document.createElement('img');
        separatorImg.src = '../../static/elements/flash.png';
        separatorImg.className = 'separator';
        versusContainer.appendChild(separatorImg);

        const Player2Container = document.createElement('div');
        Player2Container.className = 'game-player-container';
        const player2Title = document.createElement('h2');
        player2Title.innerText = opponent.username;
        Player2Container.appendChild(player2Title);
        const player2Avatar = document.createElement('img');
        player2Avatar.src = `https://${ip_address}:8000/media/${opponent.avatar}`;
        player2Avatar.className = 'avatar';
        const player2Score = document.createElement('span');
        player2Score.innerText = this.score2;
        player2Score.className = 'score';
        Player2Container.appendChild(player2Score);
        versusContainer.appendChild(Player2Container);

        return versusContainer;
    }

}