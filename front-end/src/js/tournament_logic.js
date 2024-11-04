function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function createTournamentBracket(tournamentData) {
    const bracket = [];
    const shuffledData = shuffleArray(tournamentData);
    for (let i = 0; i < shuffledData.length; i += 2) {
        bracket.push({player1: shuffledData[i], player2: shuffledData[i + 1]});
    }
    return bracket;
}

function getAvatar(alias, tournamentData) {
    const match = tournamentData.find((player) => player.alias === alias);
    return match.avatar;
}

export function getFinalPlayers(results, tournamentData) {
    if (!results) {
        console.error("Results not set in session storage.");
        return;
    }
    const semi_final1 = results.find(result => result.stage === 'semiFinal1');
    const semi_final2 = results.find(result => result.stage === 'semiFinal2');
    const final = {player1: {alias: semi_final1.winner, avatar: getAvatar(semi_final1.winner, tournamentData)}, 
        player2: {alias: semi_final2.winner, avatar: getAvatar(semi_final2.winner, tournamentData)}};
    return final;
}
