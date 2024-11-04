function setGridAreaLeaderboard(box) {
    switch (box.classList[0]) {
        case 'first':
            box.style.gridArea = 'first';
            break;
        case 'second':
            box.style.gridArea = 'second';
            break;
        case 'third':
            box.style.gridArea = 'third';
            break;
        case 'list':
            box.style.gridArea = 'list';
            break;
    }
}

function setGridAreaProfile(box) {
    switch (box.classList[0]) {
        case 'friends':
            box.style.gridArea = 'friends';
            break;
        case 'achievements':
            box.style.gridArea = 'achievements';
            break;
        case 'notifications':
            box.style.gridArea = 'edit';
            break;
        case 'history':
            box.style.gridArea = 'history';
            break;
        case 'profile':
            box.style.gridArea = 'profile';
            break;
    }
}

function setGridAreaTournament(box) {
    switch (box.classList[0]) {
        case 'name':
            box.style.gridArea = 'name';
            break;
        case 'player1':
            box.style.gridArea = 'player1';
            break;
		case 'player2':
            box.style.gridArea = 'player2';
            break;
		case 'player3':
            box.style.gridArea = 'player3';
            break;
		case 'player4':
            box.style.gridArea = 'player4';
            break;
        case 'map':
            box.style.gridArea = 'map';
            break;
    }
}

function setGridAreaHome(box) {
    switch (box.classList[0]) {
        case 'friends':
            box.style.display = 'flex';
            box.style.gridArea = 'friends';
            break;
        case 'achievements':
            box.style.display = 'flex';
            box.style.gridArea = 'achievements';
            break;
        case 'notifications':
            box.style.display = 'flex';
            box.style.gridArea = 'notifications';
            break;
        case 'tournament':
            box.style.display = 'flex';
            box.style.gridArea = 'tournament';
            break;
        case 'profile':
            box.style.display = 'flex';
            box.style.gridArea = 'profile';
            break;
        case 'selectmap':
            box.style.display = 'flex';
            box.style.gridArea = 'selectmap';
            break;
        case 'leaderboard':
            box.style.display = 'flex';
            box.style.gridArea = 'leaderboard';
            break;
    }
}

export { setGridAreaHome, setGridAreaLeaderboard, setGridAreaProfile, setGridAreaTournament }