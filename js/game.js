/**
 * game.js - Główny silnik trybu Solo dla RAPQUIZ.
 * Zawiera logikę ładowania pytań, timery, walidację, punktację oraz koła ratunkowe.
 */

let allQuestions = {};
let currentPool = [];
let currentQuestion = null;

// Stan gry
let state = {
    score: 0,
    mistakes: 0,
    streak: 0,
    startTime: 0,
    category: '',
    lifelines: {
        '5050': true,
        'phone': true,
        'audience': true,
        'skip': true
    }
};

let timerInterval = null;
const TIME_LIMIT = 20;
let timeLeft = TIME_LIMIT;

// ── Inicjalizacja i przejścia widoków ───────────────────────────────
function showView(viewId) {
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('setupView').style.display = 'none';
    document.getElementById('gameView').style.display = 'none';
    document.getElementById('gameOverView').style.display = 'none';
    const hubView = document.getElementById('multiplayerHubView');
    if(hubView) hubView.style.display = 'none';
    const lobbyView = document.getElementById('lobbyView');
    if(lobbyView) lobbyView.style.display = 'none';
    const tHub = document.getElementById('tournamentHubView');
    if(tHub) tHub.style.display = 'none';
    const tBrack = document.getElementById('tournamentBracketView');
    if(tBrack) tBrack.style.display = 'none';
    const subQ = document.getElementById('submitQuestionView');
    if(subQ) subQ.style.display = 'none';
    const infoV = document.getElementById('infoView');
    if(infoV) infoV.style.display = 'none';
    const dailySetup = document.getElementById('dailySetupView');
    if(dailySetup) dailySetup.style.display = 'none';
    
    // Toggle sidebar
    const sidebar = document.getElementById('sidebarRight');
    const mainWrap = document.querySelector('main');
    if(viewId === 'menuView') {
        if(sidebar) sidebar.style.display = 'flex';
        if(mainWrap) mainWrap.classList.add('with-sidebar');
    } else {
        if(sidebar) sidebar.style.display = 'none';
        if(mainWrap) mainWrap.classList.remove('with-sidebar');
    }

    const el = document.getElementById(viewId);
    if(el) el.style.display = 'flex';
}

function showMenu() {
    showView('menuView');
    // reset ewentualnych timerów w tle
    clearInterval(timerInterval);
}

window.isEndlessSelected = false;
window.startGame = function(endless) {
    const token = localStorage.getItem('rapquiz_token');
    if (!token) {
        document.getElementById('authModal').style.display = 'flex';
        return;
    }
    window.isEndlessSelected = !!endless;
    showView('setupView');
}

// ── Ładowanie Pytań ───────────────────────────────────────────────
function loadQuestions() {
    // Teraz ładujemy bezpośrednio ze zdefiniowanej zmiennej z questions.js
    if (typeof RAPQUIZ_QUESTIONS !== 'undefined') {
        allQuestions = RAPQUIZ_QUESTIONS;
    } else {
        console.error("Brak obiektu RAPQUIZ_QUESTIONS! Upewnij się że plik questions.js jest załadowany.");
    }
}
loadQuestions(); 

// ── Rozpoczęcie meczu ───────────────────────────────────────────────
function initGame(category) {
    const statsContainer = document.getElementById('gameStatsContainer');
    if(statsContainer) {
        statsContainer.innerHTML = `WYNIK: <span id="gameScore" class="gold-text">0</span> | BŁĘDY: <span id="gameMistakes" class="red-text">...</span>`;
    }
    window.isMultiplayer = false;
    document.querySelector('.lifelines-bar').style.display = 'flex';
    
    state = {
        score: 0,
        mistakes: 0,
        streak: 0,
        category: category,
        isEndless: window.isEndlessSelected,
        lifelines: { '5050': true, 'phone': true, 'audience': true, 'skip': true }
    };

    // Budowa puli pytań w oparciu o wybraną epokę lub "Wszystko"
    if (category === 'wszystko') {
        currentPool = [];
        Object.values(allQuestions).forEach(arr => currentPool = currentPool.concat(arr));
    } else {
        currentPool = [...(allQuestions[category] || [])];
    }
    
    if (currentPool.length === 0) {
        alert('Kategoria jest pusta.');
        return;
    }

    // Proste tasowanie pytań (Fisher-Yates)
    for (let i = currentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentPool[i], currentPool[j]] = [currentPool[j], currentPool[i]];
    }

    if (!state.isEndless && currentPool.length > 20) {
        // Zostawiamy dokładnie 20 pytań dla trybu Klasycznego
        currentPool = currentPool.slice(0, 20);
    }

    updateUIStats();
    resetLifelinesUI();
    showView('gameView');
    
    // Krótkie oczekiwanie i start
    setTimeout(nextQuestion, 500);
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

function initDailyGame() {
    const dateStr = new Date().toISOString().split('T')[0];
    const seedNum = parseInt(dateStr.replace(/-/g, ''));
    const prng = mulberry32(seedNum);
    
    const statsContainer = document.getElementById('gameStatsContainer');
    if(statsContainer) {
        statsContainer.innerHTML = `WYNIK: <span id="gameScore" class="gold-text">0</span> | PYTANIE: <span id="gameMistakes" class="gold-text">1/10</span>`;
    }
    
    window.isMultiplayer = false;
    document.querySelector('.lifelines-bar').style.display = 'none';

    state = {
        score: 0,
        mistakes: 0,
        streak: 0,
        category: 'daily',
        isDaily: true,
        lifelines: { '5050': false, 'phone': false, 'audience': false, 'skip': false }
    };

    currentPool = [];
    Object.values(allQuestions).forEach(arr => currentPool = currentPool.concat(arr));
    
    for (let i = currentPool.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [currentPool[i], currentPool[j]] = [currentPool[j], currentPool[i]];
    }
    
    currentPool = currentPool.slice(0, 10);
    currentPool.reverse();

    if(statsContainer) {
       document.getElementById('gameScore').textContent = '0';
       document.getElementById('gameMistakes').textContent = '1/10';
    }
    showView('gameView');
    setTimeout(nextQuestion, 500);
}

// ── Render Tury ───────────────────────────────────────────────────
function nextQuestion() {
    if (state.isDaily) {
        if (state.mistakes >= 10) return endGame();
    } else if (state.isEndless) {
        if (state.mistakes >= 2) return endGame();
    }
    // W trybie "Klasycznym" (20 pytań) grzejemy do końca puli bez limitu wyrzucenia za błędy
    
    if (currentPool.length === 0) {
        if (!state.isDaily && !state.isEndless) {
            showNotification("Ukończyłeś klasyczne 20 pytań!", "var(--accent-yellow)");
        } else {
            showNotification("Wyczerpałeś kategorię!", "var(--accent-blue)");
        }
        setTimeout(endGame, 1500);
        return;
    }

    currentQuestion = currentPool.pop();
    
    document.getElementById('questionText').textContent = currentQuestion.question;
    renderAnswers(currentQuestion.answers);
    
    startTimer();
}

function renderAnswers(answers) {
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';
    
    answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = ans;
        // Zapisujemy prawdziwy indeks przed tasowaniem odpowiedzi UI (jeśli byśmy chcieli tasować)
        // W RAPQUIZ klasycznie wystarczy zrenderować w tej samej kolejności jak JSON
        btn.onclick = () => handleAnswer(index, btn);
        btn.dataset.index = index;
        grid.appendChild(btn);
    });
}

// ── Obsługa Czasu ─────────────────────────────────────────────────
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_LIMIT;
    state.startTime = Date.now();
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeIsUp();
        }
    }, 100);
}

function updateTimerUI() {
    const bar = document.getElementById('timerBar');
    const percentage = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
    bar.style.width = percentage + '%';
    
    if (timeLeft <= 5) {
        bar.style.backgroundColor = 'var(--accent-red)';
    } else if (timeLeft <= 10) {
        bar.style.backgroundColor = 'var(--accent-yellow)';
    } else {
        bar.style.backgroundColor = 'var(--green)';
    }
}

function timeIsUp() {
    handleAnswer(-1, null); // -1 oznacza brak odpowiedzi
}

// ── Walidacja i Akcje ───────────────────────────────────────────────
function handleAnswer(selectedIndex, btnElement) {
    clearInterval(timerInterval);
    const answersGrid = document.getElementById('answersGrid');
    const allButtons = Array.from(answersGrid.children);
    
    // Zablokuj wszystkie
    allButtons.forEach(b => b.disabled = true);
    
    const isCorrect = (selectedIndex === currentQuestion.correct);
    
    if (isCorrect) {
        if (btnElement) btnElement.classList.add('correct');
        const resolveTime = (Date.now() - state.startTime) / 1000;
        
        let pts = 60;
        if (resolveTime <= 5) {
            pts = 100;
            state.fastStreak = (state.fastStreak || 0) + 1;
            if(state.fastStreak >= 10 && !state.isDaily && !window.isMultiplayer) {
               let st = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"gamesPlayed":0, "highScore":0, "badges":[]}');
               if(!st.badges.includes('freestyle')) {
                   st.badges.push('freestyle');
                   localStorage.setItem('rapquiz_stats', JSON.stringify(st));
                   showNotification("ODZNAKA: FREESTYLE KING!", "var(--accent-yellow)");
               }
            }
        } else {
            pts = 80;
            state.fastStreak = 0;
        }
        
        state.score += pts;
        state.streak++;
        
        // Bonusy za streak
        if (state.streak === 5) {
            state.score += 50;
            showNotification("🔥 5 WZOROWO (+50) 🔥", "var(--accent-orange)");
        } else if (state.streak === 10) {
            state.score += 150;
            showNotification("⚡ FREESTYLE KING (+150) ⚡", "var(--accent-yellow)");
        } else {
            showNotification(`+${pts} PKT`, "var(--green)");
        }
        
    } else {
        // Zła odpowiedz (lub timeout)
        if (state.isEndless) state.mistakes++;
        state.streak = 0;
        state.fastStreak = 0;
        
        if (btnElement) btnElement.classList.add('wrong');
        
        // Pokaż poprawną odpowiedź dla jasności
        const correctBtn = allButtons.find(b => parseInt(b.dataset.index) === currentQuestion.correct);
        if (correctBtn) correctBtn.classList.add('correct');
        
        showNotification("BŁĄD!", "var(--accent-red)");
    }
    
    if (state.isDaily) {
       state.mistakes++;
       const statsContainer = document.getElementById('gameStatsContainer');
       if (statsContainer) {
           document.getElementById('gameScore').textContent = state.score;
           document.getElementById('gameMistakes').textContent = `${Math.min(state.mistakes + 1, 10)}/10`;
       }
    } else {
       updateUIStats();
    }
    
    // Oczekiwanie na przejscie
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

function updateUIStats() {
    document.getElementById('gameScore').textContent = state.score;
    if (state.isEndless) {
        document.getElementById('gameMistakes').textContent = `${state.mistakes}/2`;
    } else {
        document.getElementById('gameMistakes').textContent = `-`;
    }
}

function showNotification(msg, color) {
    const notif = document.getElementById('gameNotification');
    notif.textContent = msg;
    notif.style.color = color;
    notif.classList.add('show');
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 1500);
}

// ── Koła Ratunkowe (Lifelines) ────────────────────────────────────
function useLifeline(type) {
    if (!state.lifelines[type]) return;
    
    const btn = document.getElementById(`ll-${type}`);
    btn.disabled = true;
    btn.classList.add('used');
    state.lifelines[type] = false;
    
    switch(type) {
        case '5050':
            execute5050();
            break;
        case 'phone':
            alert(`📞 Ziąbek pisze SMS-em:\n\n"${currentQuestion.hint}"`);
            break;
        case 'audience':
            executeAudience();
            break;
        case 'skip':
            clearInterval(timerInterval);
            showNotification("Pytanie pominięte!", "var(--text-main)");
            // Ustaw jako puste 
            setTimeout(() => nextQuestion(), 1000);
            break;
    }
}

function execute5050() {
    const buttons = Array.from(document.getElementById('answersGrid').children);
    let wrongIndexes = [];
    buttons.forEach((b, idx) => {
        if (idx !== currentQuestion.correct) wrongIndexes.push(idx);
    });
    
    // Wymieszaj błędne
    wrongIndexes = wrongIndexes.sort(() => Math.random() - 0.5);
    // Ukryj (zablokuj i wyzeruj tekst) 2 pierwsze z wymieszanych błędnych
    const toHide = wrongIndexes.slice(0, 2);
    toHide.forEach(idx => {
        buttons[idx].disabled = true;
        buttons[idx].textContent = '---';
    });
}

function executeAudience() {
    // Generuje fejkowe procenty z naciskiem na poprawną odpowiedź
    const correctPercent = Math.floor(Math.random() * 40) + 40; // 40-80%
    let remaining = 100 - correctPercent;
    
    let scores = [0, 0, 0, 0];
    scores[currentQuestion.correct] = correctPercent;
    
    // Rozdzielenie reszty % na 3 złe odpowiedzi
    const others = [0,1,2,3].filter(i => i !== currentQuestion.correct);
    const split1 = Math.floor(Math.random() * remaining);
    remaining -= split1;
    const split2 = Math.floor(Math.random() * remaining);
    const split3 = remaining - split2;
    
    scores[others[0]] = split1;
    scores[others[1]] = split2;
    scores[others[2]] = split3;
    
    let chart = "Wyniki Głosowania Publiczności:\n\n";
    scores.forEach((s, idx) => {
        chart += `${String.fromCharCode(65 + idx)}: ${s}%\n`;
    });
    
    alert(chart);
}

function resetLifelinesUI() {
    const types = ['5050', 'phone', 'audience', 'skip'];
    types.forEach(t => {
        const btn = document.getElementById(`ll-${t}`);
        if(btn) {
            btn.disabled = false;
            btn.classList.remove('used');
        }
    });
}

// ── Koniec Gry ────────────────────────────────────────────────────
function endGame() {
    clearInterval(timerInterval);
    showView('gameOverView');
    
    const scoreboardEl = document.getElementById('mpScoreboard');
    if (scoreboardEl) scoreboardEl.style.display = 'none';
    
    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('finalStreak').textContent = state.streak;
    
    const msgEl = document.getElementById('gameOverMsg');
    if (state.score > 1000) {
        msgEl.textContent = "DIAMENTOWA PŁYTA! 🔥";
        msgEl.style.color = 'var(--accent-yellow)';
    } else if (state.score > 500) {
        msgEl.textContent = "ZŁOTA PŁYTA! MOCNE!";
        msgEl.style.color = '#cccccc';
    } else {
        msgEl.textContent = "MUSISZ JESZCZE SPORO POĆWICZYĆ.";
        msgEl.style.color = 'var(--text-muted)';
    }
    
    // Zapis docelowo do serwera - wysłanie fetch na /api/profile
    saveScore(state.score);
}

// Zapis Wyników oraz Odznak (Faza 7)
function saveScore(score) {
    console.log("Zapisano wynik do API: ", score);
    
    const userStr = localStorage.getItem('rapquiz_user');
    if(userStr) {
        try {
            const user = JSON.parse(userStr);
            const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
            fetch(`${API_URL}/api/ranking/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: user.username, 
                    score: score,
                    usedLifelines: {
                       fifty_fifty: document.getElementById('ll-5050').classList.contains('used'),
                       audience: document.getElementById('ll-audience').classList.contains('used'),
                       phone: document.getElementById('ll-phone').classList.contains('used'),
                       skip: document.getElementById('ll-skip').classList.contains('used')
                    }
                })
            }).catch(console.error);
        } catch(e) {}
    }
    
    // Zapis statystyk lokalnie
    let stats = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"gamesPlayed":0, "highScore":0, "totalScore":0, "badges":[]}');
    stats.gamesPlayed++;
    stats.totalScore = (stats.totalScore || 0) + score;   // suma ze wszystkich gier
    if(score > stats.highScore) stats.highScore = score;
    
    if(!stats.badges.includes('rookie') && stats.gamesPlayed >= 10) stats.badges.push('rookie');
    if(!stats.badges.includes('diamond') && score >= 1000) stats.badges.push('diamond');
    
    if(!stats.badges.includes('zlotaera') && state.category === '1990-2010' && state.mistakes === 0 && score > 0) stats.badges.push('zlotaera');
    
    let usedLifelines = !state.lifelines['5050'] || !state.lifelines['phone'] || !state.lifelines['audience'] || !state.lifelines['skip'];
    if(!stats.badges.includes('milczacy') && !usedLifelines && state.mistakes < 2 && !state.isDaily && score > 0) stats.badges.push('milczacy');
    
    localStorage.setItem('rapquiz_stats', JSON.stringify(stats));

    if (state.isDaily) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('rapquiz_dailyLastPlay', today);
        
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
        const userStr = localStorage.getItem('rapquiz_user');
        const username = userStr ? JSON.parse(userStr).username : 'Anonim';
        
        fetch(`${API_URL}/api/daily/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score: score, date: today })
        }).catch(err => console.error("Error saving daily score", err));
    }
}
