// Nowa logika "Igrzyska (Battle Royale)" korzysta z bazowego silnika multiplayer. 
// Te funkcje to tylko pomosty do `multiplayer.js`.

window.tournamentHost = function() {
    initSocket();
    document.getElementById('multiplayerError').textContent = '';
    socket.emit('create_tournament', { username: getUserName() });
}

window.tournamentJoin = function() {
    const code = document.getElementById('joinTournamentCode').value.trim().toUpperCase();
    if(!code) return;
    initSocket();
    document.getElementById('multiplayerError').textContent = '';
    socket.emit('join_tournament', { code, username: getUserName() });
}

window.tournamentLeave = function() {
    window.multiplayerLeaveLobby();
}

window.tournamentStartGame = function(cat) {
    window.multiplayerStartGame(cat);
}

