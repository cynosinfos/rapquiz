const API_URL_SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
let socket = null;
let currentRoom = null;
let isHost = false;
window.isMultiplayer = false;
let mpState = {
   scoreMe: 0,
   aliveMe: true,
   isTourney: false,
   opponents: [], // tablica z {id, name, score, alive}
   round: 0
};

function updateLobbyPlayersList(players) {
    const container = document.getElementById('lobbyPlayersContainer');
    if (!container) return;
    container.innerHTML = '';
    
    // Zawsze pokazujemy aktualnych graczy i ewentualnie puste miejsca do limitu 20
    const displaySlots = Math.max(2, players.length + 1);
    const maxSlots = Math.min(displaySlots, 20);
    
    for (let i = 0; i < maxSlots; i++) {
        const div = document.createElement('div');
        if (i < players.length) {
            const p = players[i];
            div.textContent = p.id === socket.id ? `TY (${p.name})` : p.name;
            div.style.color = p.id === socket.id ? 'var(--accent-yellow)' : 'var(--text-main)';
            div.style.fontSize = i < 2 ? '1.5rem' : '1.2rem';
        } else {
            div.textContent = (i === 1 && players.length === 1) ? `CZEKAM NA INNYCH GRACZY...` : `...`;
            div.style.color = 'var(--text-dim)';
            div.style.fontSize = i < 2 ? '1.5rem' : '1.2rem';
        }
        container.appendChild(div);
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
            mpState.aliveMe = true;
            mpState.isTourney = data.isTourney || false;
            mpState.round = 0;
            mpState.opponents = data.players.filter(p => p.id !== socket.id).map(p => ({ id: p.id, name: p.name, score: 0, alive: true }));
            updateMPStatsUI();
            
            document.querySelector('.lifelines-bar').style.display = 'none';
            showView('gameView');
            
            const badge = document.getElementById('activeModeBadge');
            if (badge) {
                badge.textContent = data.isTourney ? "TRYB: TURNIEJ" : "TRYB: ONLINE";
                badge.style.background = data.isTourney ? "var(--accent-red)" : "var(--accent-blue)";
                badge.style.color = "#fff";
            }
        });

        socket.on('next_question', (q) => {
            mpState.round++;
            document.getElementById('questionText').textContent = `[${mpState.round}/20] ` + q.question;
            renderAnswersMP(q.answers);
            if (mpState.aliveMe) {
                startMPTimer();
            } else {
                // Gracz martwy tylko ogląda
                mpTimeLeft = 15;
                Array.from(document.getElementById('answersGrid').children).forEach(b => b.disabled = true);
                document.getElementById('timerBar').style.width = '0%';
            }
        });

        socket.on('round_results', (results) => {
            clearInterval(mpTimerInterval);
            const me = results[socket.id] || {pointsEarned:0, alive:true};
            
            mpState.scoreMe += me.pointsEarned;
            if (mpState.isTourney && !me.alive) mpState.aliveMe = false;
            
            mpState.opponents.forEach(opp => {
                const r = results[opp.id];
                if (r) {
                    opp.score += r.pointsEarned;
                    if (mpState.isTourney && !r.alive) opp.alive = false;
                }
            });
            
            updateMPStatsUI();
            
            let color = 'var(--text-main)';
            let msg = `Otrzymujesz +${me.pointsEarned} pkt`;
            
            if(me.pointsEarned >= 2) { color='var(--accent-yellow)'; msg='DOBRZE! '+msg; }
            else if (me.pointsEarned === 0) { color='var(--accent-red)'; msg='PUDŁO! (Brak pkt)'; }
            
            if (mpState.isTourney && !mpState.aliveMe) {
                msg = "ODPADASZ! ZŁA ODPOWIEDŹ!";
                color = 'var(--accent-red)';
            }
            
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
            
            // W trybie MP ukrywamy sekcję standardowych statystyk i uzywamy własnych tabel
            const spStats = document.getElementById('singlePlayerFinalStats');
            if (spStats) spStats.style.display = 'none';

            
            const msgEl = document.getElementById('gameOverMsg');
            let isTourneyWin = false;
            let isMultiplayerWin = false;

            if(final.winnerId === socket.id) {
                msgEl.textContent = "🏆 WYGRYWASZ MECZ! Gratulacje!";
                msgEl.style.color = "var(--accent-yellow)";
                if (mpState.isTourney) isTourneyWin = true;
                else isMultiplayerWin = true;
            } else if (final.winnerId === 'draw') {
                msgEl.textContent = "🤝 REMIS!";
                msgEl.style.color = "white";
            } else {
                msgEl.textContent = `Porażka. Przeciwnik zgarnął wygraną!`;
                msgEl.style.color = "var(--accent-red)";
            }
            
            const userStr = localStorage.getItem('rapquiz_user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const apiEndpoint = API_URL_SOCKET || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '');
                    fetch(`${apiEndpoint}/api/ranking/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            username: user.username, 
                            score: mpState.scoreMe,
                            isTourneyWin: isTourneyWin,
                            isMultiplayerWin: isMultiplayerWin
                        })
                    }).catch(console.error);
                } catch(e) {}
            }
            
            // Zapis statystyk MP lokalnie do Profilu
            let stats = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"gamesPlayed":0,"highScore":0,"totalScore":0,"badges":[],"correctAnswers":0,"wrongAnswers":0,"tourneyWins":0,"mpWins":0}');
            stats.gamesPlayed++;
            stats.mpGamesPlayed = (stats.mpGamesPlayed || 0) + 1;
            stats.totalScore = (stats.totalScore || 0) + mpState.scoreMe;
            if(mpState.scoreMe > stats.highScore) stats.highScore = mpState.scoreMe;
            if(isTourneyWin) stats.tourneyWins = (stats.tourneyWins || 0) + 1;
            if(isMultiplayerWin) stats.mpWins = (stats.mpWins || 0) + 1;
            // Odznaki MP
            const addB = (k) => { if (!stats.badges.includes(k)) stats.badges.push(k); };
            if (stats.mpGamesPlayed >= 1) addB('showman');
            if ((stats.mpWins || 0) >= 5) addB('bossulicy');
            if ((stats.mpWins || 0) >= 10) addB('klan');
            localStorage.setItem('rapquiz_stats', JSON.stringify(stats));
            
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
            
            // RENDERING HISTORII PYTAŃ (NOWOŚĆ)
            const histContainer = document.getElementById('mpHistoryContainer');
            if (histContainer && final.history) {
                histContainer.style.display = 'block';
                
                let allPlayers = [ { id: socket.id, name: getUserName() + ' (TY)' } ];
                mpState.opponents.forEach(o => {
                    allPlayers.push({ id: o.id, name: o.name });
                });
                
                let tbl = `<h3 style="color:var(--accent-blue); margin: 30px 0 10px 0; font-family:var(--font-main);">HISTORIA ODPOWIEDZI</h3>`;
                tbl += `<div style="background:rgba(0,0,0,0.5); border:1px solid #444; border-radius:8px; padding:10px;"><table style="width:100%; border-collapse:collapse; text-align:center; font-size: 0.9rem;">`;
                
                // Nagłówki
                tbl += `<tr><th style="padding:8px; border-bottom:1px solid #666; text-align:left; color:var(--text-dim);">Pytanie</th>`;
                allPlayers.forEach(p => {
                    tbl += `<th style="padding:8px; border-bottom:1px solid #666; color:var(--text-main); font-family:var(--font-mono);">${p.name.split(' ')[0]}</th>`;
                });
                tbl += `</tr>`;
                
                // Wiersze historyczne
                final.history.forEach((hItem, idx) => {
                    tbl += `<tr style="border-bottom:1px solid #333;">`;
                    tbl += `<td style="padding:8px; text-align:left; color:#999; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${hItem.question}">${idx+1}. ${hItem.question}</td>`;
                    
                    allPlayers.forEach(p => {
                        const correct = hItem.answers[p.id];
                        let icon = `<span style="color:var(--text-dim);">-</span>`;
                        if (correct === true) icon = `✅`;
                        else if (correct === false) icon = `❌`;
                        
                        tbl += `<td style="padding:8px;">${icon}</td>`;
                    });
                    
                    tbl += `</tr>`;
                });
                
                tbl += `</table></div>`;
                histContainer.innerHTML = tbl;
            } else if (histContainer) {
                histContainer.style.display = 'none';
            }
        });
        
        socket.on('opponent_disconnected', () => {
            if (window.isMultiplayer || currentRoom) {
                if (typeof mpTimerInterval !== 'undefined') clearInterval(mpTimerInterval);
                if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
                showCustomAlert("Przeciwnik opuścił grę lub salon!");
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
    if(!container) return;
    let meDisplay = mpState.aliveMe ? `<span class="gold-text">${mpState.scoreMe}</span>` : `<span style="color:var(--accent-red); font-weight:bold;">☠️</span>`;
    let html = `WYNIK (TY): ${meDisplay} | RUNDA: <span class="gold-text">${mpState.round}/20</span> | `;
    
    html += mpState.opponents.map(o => {
        let oppScore = o.alive ? `<span class="red-text">${o.score}</span>` : `<span style="color:var(--text-dim);">☠️</span>`;
        return `${o.name}: ${oppScore}`;
    }).join(' | ');
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
