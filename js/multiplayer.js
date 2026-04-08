const API_URL_SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
let socket = null;
let currentRoom = null;
let isHost = false;
window.isMultiplayer = false;
let mpState = {
   scoreMe: 0,
   opponents: [], // tablica z {id, name, score}
   round: 0
};

function updateLobbyPlayersList(players) {
    for (let i = 1; i <= 4; i++) {
        const pEl = document.getElementById('lobbyPlayer' + i);
        if (pEl) {
            if (i - 1 < players.length) {
                const p = players[i - 1];
                pEl.textContent = p.id === socket.id ? `TY (${p.name})` : p.name;
                pEl.style.color = p.id === socket.id ? 'var(--accent-yellow)' : 'var(--text-main)';
            } else {
                pEl.textContent = i === 2 ? `CZEKAM NA INNYCH GRACZY...` : `...`;
                pEl.style.color = 'var(--text-dim)';
            }
        }
    }
}

function initSocket() {
    if (!socket) {
        socket = io(API_URL_SOCKET);
        
        socket.on('room_created', (data) => {
            currentRoom = data.roomCode;
            isHost = true;
            document.getElementById('lobbyCodeLabel').textContent = currentRoom;
            updateLobbyPlayersList(data.players);
            document.getElementById('lobbyHostControls').style.display = 'none';
            showView('lobbyView');
        });
        
        socket.on('player_joined', (data) => {
            updateLobbyPlayersList(data.players);
            if (isHost && data.players.length >= 2) {
                document.getElementById('lobbyHostControls').style.display = 'flex';
                document.getElementById('lobbyHostControls').style.flexDirection = 'column';
            }
        });
        
        socket.on('room_joined', (data) => {
            currentRoom = data.roomCode;
            isHost = false;
            document.getElementById('lobbyCodeLabel').textContent = currentRoom;
            updateLobbyPlayersList(data.players);
            document.getElementById('lobbyHostControls').style.display = 'none';
            showView('lobbyView');
        });

        socket.on('room_error', (msg) => {
            document.getElementById('multiplayerError').textContent = msg;
        });

        socket.on('game_started', (data) => {
            window.isMultiplayer = true;
            mpState.scoreMe = 0;
            mpState.round = 0;
            mpState.opponents = data.players.filter(p => p.id !== socket.id).map(p => ({ id: p.id, name: p.name, score: 0 }));
            updateMPStatsUI();
            
            document.querySelector('.lifelines-bar').style.display = 'none';
            showView('gameView');
        });

        socket.on('next_question', (q) => {
            mpState.round++;
            document.getElementById('questionText').textContent = `[${mpState.round}/20] ` + q.question;
            renderAnswersMP(q.answers);
            startMPTimer();
        });

        socket.on('round_results', (results) => {
            clearInterval(mpTimerInterval);
            const me = results[socket.id] || {pointsEarned:0};
            
            mpState.scoreMe += me.pointsEarned;
            
            mpState.opponents.forEach(opp => {
                const r = results[opp.id];
                if (r) opp.score += r.pointsEarned;
            });
            
            updateMPStatsUI();
            
            let color = 'var(--text-main)';
            let msg = `Otrzymujesz +${me.pointsEarned} pkt`;
            
            // Proste chwalenie, jeśli zdobyliśmy więcej niż 0 i obiektywnie ładnie 
            if(me.pointsEarned >= 2) { color='var(--accent-yellow)'; msg='DOBRZE! '+msg; }
            else if (me.pointsEarned === 0) { color='var(--accent-red)'; msg='PUDŁO! (Brak pkt)'; }
            
            showNotification(msg, color);
            
            const btns = Array.from(document.getElementById('answersGrid').children);
            if(btns[results.correctIndex]) {
               btns[results.correctIndex].classList.add('correct');
            }
        });

        socket.on('multiplayer_game_over', (final) => {
            clearInterval(mpTimerInterval);
            window.isMultiplayer = false;
            document.querySelector('.lifelines-bar').style.display = 'flex';
            
            showView('gameOverView');
            document.getElementById('finalScore').textContent = `${mpState.scoreMe} PKT (Twój wynik)`;
            document.getElementById('finalStreak').textContent = "-";
            
            const msgEl = document.getElementById('gameOverMsg');
            if(final.winnerId === socket.id) {
                msgEl.textContent = "🏆 WYGRYWASZ MECZ! Gratulacje!";
                msgEl.style.color = "var(--accent-yellow)";
            } else if (final.winnerId === 'draw') {
                msgEl.textContent = "🤝 REMIS!";
                msgEl.style.color = "white";
            } else {
                msgEl.textContent = `Porażka. Przeciwnik zgarnął wygraną!`;
                msgEl.style.color = "var(--accent-red)";
            }
            
            const scoreboardEl = document.getElementById('mpScoreboard');
            if (scoreboardEl && final.scores) {
                scoreboardEl.style.display = 'block';
                let allPlayers = [
                    { name: getUserName() + ' (TY)', score: mpState.scoreMe }
                ];
                mpState.opponents.forEach(o => {
                    allPlayers.push({ name: o.name, score: o.score });
                });
                allPlayers.sort((a,b) => b.score - a.score);
                
                let boardHtml = '<h3 style="color:var(--accent-blue); margin-bottom:10px; font-family:var(--font-main);">TABELA WYNIKÓW</h3>';
                boardHtml += '<table style="width:100%; border-collapse:collapse; text-align:left;">';
                allPlayers.forEach((p, index) => {
                    let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    boardHtml += `<tr style="border-bottom:1px solid #444;">
                        <td style="padding:8px;">${medal} ${index+1}.</td>
                        <td style="padding:8px; font-weight:bold; color:var(--text-main);">${p.name}</td>
                        <td style="padding:8px; text-align:right; color:var(--accent-yellow);">${p.score} pkt</td>
                    </tr>`;
                });
                boardHtml += '</table>';
                scoreboardEl.innerHTML = boardHtml;
            }
        });
        
        socket.on('opponent_disconnected', () => {
            if (window.isMultiplayer || currentRoom) {
                alert("Przeciwnik opuścił grę lub salon!");
                window.isMultiplayer = false;
                currentRoom = null;
                document.querySelector('.lifelines-bar').style.display = 'flex';
                showMenu();
            }
        });
    }
}

function getUserName() {
    const userStr = localStorage.getItem('rapquiz_user');
    if (userStr) {
        try {
            return JSON.parse(userStr).username;
        } catch(e){}
    }
    return "Gracz_" + Math.floor(Math.random()*1000);
}

function multiplayerHostRoom() {
    initSocket();
    document.getElementById('multiplayerError').textContent = '';
    socket.emit('create_room', { username: getUserName() });
}

function multiplayerJoinRoom() {
    const code = document.getElementById('joinRoomCode').value.trim().toUpperCase();
    if (!code) {
        document.getElementById('multiplayerError').textContent = 'Podaj poprawny kod pokoju.';
        return;
    }
    initSocket();
    document.getElementById('multiplayerError').textContent = '';
    socket.emit('join_room', { roomCode: code, username: getUserName() });
}

function multiplayerLeaveLobby() {
    if(socket && currentRoom) {
        socket.emit('leave_room', { roomCode: currentRoom });
        currentRoom = null;
    }
    showMenu();
}

// Musimy dołączyć to do obiektu globalnego
window.multiplayerHostRoom = multiplayerHostRoom;
window.multiplayerJoinRoom = multiplayerJoinRoom;
window.multiplayerLeaveLobby = multiplayerLeaveLobby;

window.multiplayerStartGame = function(category) {
    if(socket && currentRoom && isHost) {
        socket.emit('start_multiplayer_game', { roomCode: currentRoom, category: category });
    }
}

// ── MP In-Game Logic
let mpTimerInterval;
let mpTimeLeft = 15;

function startMPTimer() {
    clearInterval(mpTimerInterval);
    mpTimeLeft = 15;
    updateMPTimerUI();
    
    mpTimerInterval = setInterval(() => {
        mpTimeLeft -= 0.1;
        updateMPTimerUI();
        if (mpTimeLeft <= 0) {
            clearInterval(mpTimerInterval);
            window.multiplayerHandleAnswer(-1, null);
        }
    }, 100);
}

function updateMPTimerUI() {
    const bar = document.getElementById('timerBar');
    const percentage = Math.max(0, (mpTimeLeft / 15) * 100);
    bar.style.width = percentage + '%';
    if (mpTimeLeft <= 5) bar.style.backgroundColor = 'var(--accent-red)';
    else if (mpTimeLeft <= 10) bar.style.backgroundColor = 'var(--accent-yellow)';
    else bar.style.backgroundColor = 'var(--green)';
}

function renderAnswersMP(answers) {
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';
    answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = ans;
        btn.onclick = () => window.multiplayerHandleAnswer(index, btn);
        btn.dataset.index = index;
        grid.appendChild(btn);
    });
}

function updateMPStatsUI() {
    const container = document.getElementById('gameStatsContainer');
    let html = `TY: <span class="gold-text">${mpState.scoreMe}</span> | `;
    html += mpState.opponents.map(o => `${o.name}: <span class="red-text">${o.score}</span>`).join(' | ');
    container.innerHTML = html;
}

window.multiplayerHandleAnswer = function(selectedIndex, btnElement) {
    clearInterval(mpTimerInterval);
    const answersGrid = document.getElementById('answersGrid');
    const allButtons = Array.from(answersGrid.children);
    allButtons.forEach(b => b.disabled = true);
    
    if (btnElement) btnElement.style.border = '2px solid var(--accent-yellow)';
    
    socket.emit('submit_answer', {
        roomCode: currentRoom,
        answerIndex: selectedIndex,
        timeLeft: mpTimeLeft
    });
}
