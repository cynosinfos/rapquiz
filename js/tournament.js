let tsSocket = null;
let currentTournament = null;
let isTournamentHost = false;

function initTournamentSocket() {
    if (!tsSocket) {
        const API_URL_SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
        tsSocket = io(API_URL_SOCKET);
        
        tsSocket.on('tourney_created', (data) => {
            currentTournament = data.code;
            isTournamentHost = true;
            document.getElementById('tourneyCodeLabel').textContent = currentTournament;
            showView('tournamentBracketView');
            updateBracketUI(data.bracket);
        });
        
        tsSocket.on('tourney_joined', (data) => {
            currentTournament = data.code;
            isTournamentHost = false;
            document.getElementById('tourneyCodeLabel').textContent = currentTournament;
            showView('tournamentBracketView');
            updateBracketUI(data.bracket);
        });

        tsSocket.on('tourney_error', (msg) => {
            document.getElementById('tournamentError').textContent = msg;
        });

        tsSocket.on('tourney_update', (bracket) => {
            updateBracketUI(bracket);
            if (isTournamentHost && bracket.players.length === 4 && bracket.state === 'waiting') {
                document.getElementById('tourneyHostControls').style.display = 'block';
                document.getElementById('btnStartTourney').disabled = false;
            }
            if (!isTournamentHost) {
                document.getElementById('tourneyHostControls').style.display = 'none';
            }
        });

        tsSocket.on('tourney_match_start', (matchData) => {
            document.getElementById('tourneyStatusMsg').textContent = `Twój mecz zaraz się rozpocznie!`;
            
            // Wymuszone połączenie multiplayer
            if(window.multiplayerHostRoom && !window.socket) {
                // Inicjacja glownego socketa
                initSocket(); 
            }
            setTimeout(() => {
                socket.emit('join_room', { roomCode: matchData.roomCode, username: getUserName(), isTourney: currentTournament });
            }, 1000);
        });
        
        tsSocket.on('tourney_match_ended', (data) => {
            showView('tournamentBracketView');
            if (data.msg) {
                document.getElementById('tourneyStatusMsg').textContent = data.msg;
            }
        });
    }
}

function updateBracketUI(b) {
    const p1 = b.players[0] ? b.players[0].name : 'Oczekujący...';
    const p2 = b.players[1] ? b.players[1].name : 'Oczekujący...';
    const p3 = b.players[2] ? b.players[2].name : 'Oczekujący...';
    const p4 = b.players[3] ? b.players[3].name : 'Oczekujący...';

    document.getElementById('t_p1').textContent = p1;
    document.getElementById('t_p2').textContent = p2;
    document.getElementById('t_p3').textContent = p3;
    document.getElementById('t_p4').textContent = p4;

    document.getElementById('t_f1').textContent = b.semis[0].winner ? b.semis[0].winner.name : (b.state !== 'waiting' ? 'W trakcie...' : 'Zwycięzca Półfinał 1');
    document.getElementById('t_f2').textContent = b.semis[1].winner ? b.semis[1].winner.name : (b.state !== 'waiting' ? 'W trakcie...' : 'Zwycięzca Półfinał 2');

    if(b.final.winner) {
        document.getElementById('tournamentWinnerBox').style.display = 'block';
        document.getElementById('t_champ').textContent = b.final.winner.name;
        document.getElementById('tourneyStatusMsg').textContent = "TURNIEJ ZAKOŃCZONY!";
    }
}

window.tournamentHost = function() {
    initTournamentSocket();
    document.getElementById('tournamentError').textContent = '';
    tsSocket.emit('create_tournament', { username: getUserName() });
}

window.tournamentJoin = function() {
    const code = document.getElementById('joinTournamentCode').value.trim().toUpperCase();
    if(!code) return;
    initTournamentSocket();
    document.getElementById('tournamentError').textContent = '';
    tsSocket.emit('join_tournament', { code, username: getUserName() });
}

window.tournamentLeave = function() {
    if(tsSocket && currentTournament) {
        tsSocket.emit('leave_tournament', { code: currentTournament });
        currentTournament = null;
    }
    showMenu();
}

window.tournamentStartGame = function(cat) {
    if(tsSocket && currentTournament && isTournamentHost) {
        tsSocket.emit('start_tournament', { code: currentTournament, category: cat });
        document.getElementById('tourneyHostControls').style.display = 'none';
        document.getElementById('tourneyStatusMsg').textContent = "Uruchamianie serwerów meczowych...";
    }
}
