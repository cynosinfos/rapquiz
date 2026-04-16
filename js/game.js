/**
 * game.js - Główny silnik trybu Solo dla RAPQUIZ.
 * Zawiera logikę ładowania pytań, timery, walidację, punktację oraz koła ratunkowe.
 */

(function() {
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
    correct_answers: 0,
    wrong_answers: 0,
    lifelines: {
        '5050': true,
        'phone': true,
        'audience': true,
        'skip': true
    }
};

let timerInterval = null;
let isTimerPaused = false;
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
    
    // Toggle sidebars
    const sRight = document.getElementById('sidebarRight');
    const sLeft = document.getElementById('sidebarLeft');
    const mainWrap = document.querySelector('main');
    
    if(viewId === 'menuView') {
        if(sRight) sRight.style.display = 'flex';
        if(sLeft) sLeft.style.display = 'flex';
        if(mainWrap) mainWrap.classList.add('with-sidebar');
    } else {
        if(sRight) sRight.style.display = 'none';
        if(sLeft) sLeft.style.display = 'none';
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
        statsContainer.innerHTML = `WYNIK: <span id="gameScore" class="gold-text">0</span> | BŁĘDY: <span id="gameMistakes" class="red-text">0/2</span> | PYTANIE: <span id="gameQuestionNum" class="gold-text">1/20</span>`;
    }
    window.isMultiplayer = false;
    document.querySelector('.lifelines-bar').style.display = 'flex';
    
    state = {
        score: 0,
        mistakes: 0,
        streak: 0,
        category: category,
        correct_answers: 0,
        wrong_answers: 0,
        isEndless: window.isEndlessSelected,
        currentQuestionNum: 0,
        totalQuestions: 0,
        isGameActive: true,
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
        if(window.showCustomAlert) window.showCustomAlert('Kategoria jest pusta.');
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
    state.totalQuestions = currentPool.length;

    // Ustawienie nagłówka trybu
    const modeBadge = document.getElementById('activeModeBadge');
    if (modeBadge) {
        if (state.isEndless) modeBadge.textContent = 'TRYB: NIESKOŃCZONY';
        else modeBadge.textContent = 'TRYB: KLASYCZNY';
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
        statsContainer.innerHTML = `WYNIK: <span id="gameScore" class="gold-text">0</span> | BŁĘDY: <span id="gameMistakes" class="red-text">0/10</span> | PYTANIE: <span id="gameQuestionNum" class="gold-text">1/10</span>`;
    }
    
    window.isMultiplayer = false;
    document.querySelector('.lifelines-bar').style.display = 'none';

    state = {
        score: 0,
        mistakes: 0,
        streak: 0,
        category: 'daily',
        correct_answers: 0,
        wrong_answers: 0,
        isDaily: true,
        currentQuestionNum: 0,
        totalQuestions: 10,
        isGameActive: true,
        lifelines: { '5050': false, 'phone': false, 'audience': false, 'skip': false }
    };

    // Obsługa Special Events (Daily)
    const today = new Date().toISOString().split('T')[0];
    let customQuestionSet = null;
    if (typeof DAILY_EVENTS !== 'undefined' && DAILY_EVENTS[today]) {
        customQuestionSet = DAILY_EVENTS[today].questions;
        document.getElementById('dailyDateLabel').innerHTML = today + `<br><span style="font-size:1rem;color:var(--text-main);">${DAILY_EVENTS[today].theme}</span>`;
    }

    currentPool = [];
    if (customQuestionSet) {
        currentPool = [...customQuestionSet];
    } else {
        Object.values(allQuestions).forEach(arr => currentPool = currentPool.concat(arr));
        for (let i = currentPool.length - 1; i > 0; i--) {
            const j = Math.floor(prng() * (i + 1));
            [currentPool[i], currentPool[j]] = [currentPool[j], currentPool[i]];
        }
        currentPool = currentPool.slice(0, 10);
    }
    currentPool.reverse();

    // Ustawienie nagłówka trybu
    const modeBadge = document.getElementById('activeModeBadge');
    if (modeBadge) modeBadge.textContent = 'TRYB: CODZIENNE WYZWANIE';

    updateUIStats();
    showView('gameView');
    setTimeout(nextQuestion, 500);
}

// ── Render Tury ───────────────────────────────────────────────────
function nextQuestion() {
    if (!state.isGameActive) return;

    if (state.isDaily) {
        if (state.mistakes >= 10) return endGame();
    } else if (state.isEndless) {
        if (state.mistakes >= 1) return endGame(); // Endless: koniec po PIERWSZYM błędzie
    } else {
        if (state.mistakes >= 2) return endGame(); // Klasyk: koniec po DRUGIM błędzie
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

    state.currentQuestionNum = (state.currentQuestionNum || 0) + 1;
    currentQuestion = currentPool.pop();
    updateUIStats();
    
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
    isTimerPaused = false;
    state.startTime = Date.now();
    updateTimerUI();

    timerInterval = setInterval(() => {
        if (isTimerPaused) return; // Pauza
        
        timeLeft -= 0.1;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeIsUp();
        }
    }, 100);
}

window.pauseGameTimer = function(paused) {
    isTimerPaused = !!paused;
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
        
        let pts = 10;
        let tLeft = (15 - resolveTime);
        if (tLeft < 0) tLeft = 0;
        
        if (state.isEndless) {
            pts = 10;
        } else {
            pts += Math.round(tLeft);
        }
        
        if (resolveTime <= 5) {
            state.fastStreak = (state.fastStreak || 0) + 1;
            // TURBO: streak odpowiedzi poniżej 3 sekund
            if (resolveTime <= 3) {
                state.ultraFastStreak = (state.ultraFastStreak || 0) + 1;
                if (state.ultraFastStreak >= 5 && !state.isDaily && !window.isMultiplayer) {
                    let st = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"badges":[]}');
                    if (!st.badges) st.badges = [];
                    if (!st.badges.includes('turbo')) {
                        st.badges.push('turbo');
                        localStorage.setItem('rapquiz_stats', JSON.stringify(st));
                        showNotification('ODZNAKA: TURBO! 🚀', 'var(--accent-blue)');
                    }
                }
            } else {
                state.ultraFastStreak = 0;
            }
            if(state.fastStreak >= 10 && !state.isDaily && !window.isMultiplayer) {
               let st = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"badges":[]}');
               if (!st.badges) st.badges = [];
               if(!st.badges.includes('freestyle')) {
                   st.badges.push('freestyle');
                   localStorage.setItem('rapquiz_stats', JSON.stringify(st));
                   showNotification('ODZNAKA: FREESTYLE KING! ⚡', 'var(--accent-yellow)');
               }
            }
        } else {
            state.fastStreak = 0;
            state.ultraFastStreak = 0;
        }
        
        state.score += pts;
        state.streak++;
        state.correct_answers++;
        
        // Bonusy za streak
        if (state.streak === 5) {
            state.score += 50;
            showNotification('🔥 5 WZOROWO (+50) 🔥', 'var(--accent-orange)');
            // GORAĆA PŁYTA badge
            if (!state.isDaily && !window.isMultiplayer) {
                let st = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"badges":[]}');
                if (!st.badges) st.badges = [];
                if (!st.badges.includes('goracaplyta')) { st.badges.push('goracaplyta'); localStorage.setItem('rapquiz_stats', JSON.stringify(st)); }
            }
        } else if (state.streak === 10) {
            state.score += 150;
            showNotification('⚡ FREESTYLE KING (+150) ⚡', 'var(--accent-yellow)');
            // ULICZNY FILOZOF badge
            if (!state.isDaily && !window.isMultiplayer) {
                let st = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"badges":[]}');
                if (!st.badges) st.badges = [];
                if (!st.badges.includes('uliczny')) { st.badges.push('uliczny'); localStorage.setItem('rapquiz_stats', JSON.stringify(st)); }
            }
        } else {
            showNotification(`+${pts} PKT`, 'var(--green)');
        }
        
    } else {
        // Zła odpowiedz (lub timeout)
        state.mistakes++; // Zliczaj błędy dla wszystkich trybów
        state.streak = 0;
        state.fastStreak = 0;
        state.wrong_answers++;
        
        if (btnElement) btnElement.classList.add('wrong');
        
        // Pokaż poprawną odpowiedź dla jasności
        const correctBtn = allButtons.find(b => parseInt(b.dataset.index) === currentQuestion.correct);
        if (correctBtn) correctBtn.classList.add('correct');
        
        showNotification("BŁĄD!", "var(--accent-red)");
    }
    // Usunięto błędne podwójne zliczanie dla Daily
    updateUIStats();
    
    // Oczekiwanie na przejscie
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

function updateUIStats() {
    const scoreEl = document.getElementById('gameScore');
    const mistakesEl = document.getElementById('gameMistakes');
    const qNumEl = document.getElementById('gameQuestionNum');
    
    if (scoreEl) scoreEl.textContent = state.score;
    
    if (mistakesEl) {
        if (state.isDaily) {
            mistakesEl.textContent = `${state.mistakes}/10`;
        } else if (state.isEndless) {
            mistakesEl.textContent = `${state.mistakes}/1`; // Endless: 1 błąd = koniec
        } else {
            mistakesEl.textContent = `${state.mistakes}/2`; // Klasyk: 2 błędy = koniec
        }
    }
    
    if (qNumEl) {
        let total = state.isEndless ? "∞" : (state.totalQuestions || 20);
        qNumEl.textContent = `${state.currentQuestionNum}/${total}`;
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

// Funkcja obsługująca własny modal
function showLifelineModal(text) {
    window.pauseGameTimer(true); // Zapauzuj timer
    document.getElementById('lifelineText').textContent = text;
    document.getElementById('lifelineModal').style.display = 'flex';
}

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
            showLifelineModal(`📞 Ziąbek wysyła SMS:\n\n"${currentQuestion.hint}"`);
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
    
    let chart = "📊 Wyniki Głosowania Publiczności:\n\n";
    scores.forEach((s, idx) => {
        // Find the actual answer text to display it nicely
        const answerText = currentQuestion.answers[idx] || String.fromCharCode(65 + idx);
        chart += `${answerText}: ${s}%\n`;
    });
    
    showLifelineModal(chart);
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
    if (!state.isGameActive) return;
    state.isGameActive = false;
    clearInterval(timerInterval);
    
    // Upewniamy się, że statystyki dla singla są resetowane i widoczne, a tabele MP ukryte
    const spStats = document.getElementById('singlePlayerFinalStats');
    if (spStats) spStats.style.display = 'block';
    const mpHistory = document.getElementById('mpHistoryContainer');
    if (mpHistory) mpHistory.style.display = 'none';
    
    showView('gameOverView');
    
    const scoreEl = document.getElementById('gameScore');
    const mistakesEl = document.getElementById('gameMistakes');
    const questionNumEl = document.getElementById('gameQuestionNum');

    if(scoreEl) scoreEl.textContent = state.score;
    if(mistakesEl) {
        if (state.isDaily) mistakesEl.textContent = `${state.mistakes}/10`;
        else if (state.isEndless) mistakesEl.textContent = `${state.mistakes}/1`;
        else mistakesEl.textContent = `${state.mistakes}/2`;
    }
    if(questionNumEl) {
        if(state.isEndless) questionNumEl.textContent = `${state.currentQuestionNum}/∞`;
        else questionNumEl.textContent = `${state.currentQuestionNum}/20`;
    }
    
    const scoreboardEl = document.getElementById('mpScoreboard');
    if (scoreboardEl) scoreboardEl.style.display = 'none';
    
    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('finalStreak').textContent = state.streak;
    
    const finalCorrectEl = document.getElementById('finalCorrect');
    if (finalCorrectEl) {
        if (state.isEndless) finalCorrectEl.textContent = `${state.correct_answers}`;
        else finalCorrectEl.textContent = `${state.correct_answers}/${state.totalQuestions}`;
    }
    
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
                    correctAnswers: state.correct_answers,
                    wrongAnswers: state.wrong_answers,
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
    const lastDailyPlay = localStorage.getItem('rapquiz_dailyLastPlay');
    let stats = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"gamesPlayed":0,"highScore":0,"totalScore":0,"badges":[],"correctAnswers":0,"wrongAnswers":0,"tourneyWins":0,"mpWins":0}');
    if (!stats.badges) stats.badges = [];
    stats.gamesPlayed++;
    stats.totalScore = (stats.totalScore || 0) + score;
    stats.correctAnswers = (stats.correctAnswers || 0) + state.correct_answers;
    stats.wrongAnswers = (stats.wrongAnswers || 0) + state.wrong_answers;
    if(score > stats.highScore) stats.highScore = score;

    // KONESER: zagrane kategorie
    if (!stats.playedCategories) stats.playedCategories = [];
    const ERA_CATS = ['1990-2010', '2010-2020', '2020-now'];
    if (state.category && ERA_CATS.includes(state.category) && !stats.playedCategories.includes(state.category)) {
        stats.playedCategories.push(state.category);
    }

    // DAILY GRIND: streak dzienny
    if (state.isDaily) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastDailyPlay === yesterday) {
            stats.dailyStreak = (stats.dailyStreak || 1) + 1;
        } else if (lastDailyPlay !== today) {
            stats.dailyStreak = 1;
        }
    }

    // === ODZNAKI ===
    const addBadge = (key) => { if (!stats.badges.includes(key)) stats.badges.push(key); };

    // Istniejące
    if (stats.gamesPlayed >= 10) addBadge('rookie');
    if (score >= 1000) addBadge('diamond');
    if (state.category === '1990-2010' && state.mistakes === 0 && score > 0) addBadge('zlotaera');
    const anyLifelineUsed = !state.lifelines['5050'] || !state.lifelines['phone'] || !state.lifelines['audience'] || !state.lifelines['skip'];
    if (!anyLifelineUsed && state.mistakes < 2 && !state.isDaily && score > 0) addBadge('milczacy');

    // Nowe: Umiejętności
    if (!state.isEndless && !state.isDaily && !window.isMultiplayer && state.mistakes === 0 && score > 0) addBadge('snajper');
    if (state.isEndless && state.correct_answers >= 15) addBadge('maraton');
    const allLifelinesUsed = !state.lifelines['5050'] && !state.lifelines['phone'] && !state.lifelines['audience'] && !state.lifelines['skip'];
    if (allLifelinesUsed && !state.isDaily && !window.isMultiplayer && score > 0) addBadge('ratownik');

    // Nowe: Postęp
    const h = new Date().getHours();
    if (h >= 23 || h < 5) addBadge('nocnazmiana');
    if (stats.totalScore >= 5000) addBadge('karciana');
    if (stats.gamesPlayed >= 50) addBadge('profesor');
    if (stats.playedCategories && stats.playedCategories.length >= 3) addBadge('koneser');
    if ((stats.dailyStreak || 0) >= 3) addBadge('dailygrind');

    // LEGENDA: 10+ innych odznak
    if (stats.badges.filter(b => b !== 'legenda').length >= 10) addBadge('legenda');

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
        }).catch(err => console.error('Error saving daily score', err));
    }
}

function leaveGameEarly() {
    console.log(">>> KLIKNIĘTO PRZYCISK OPUŚĆ <<<");
    if (typeof window.pauseGameTimer === 'function') {
        window.pauseGameTimer(true);
    }
    
    const msg = "Czy na pewno chcesz opuścić aktualnie trwającą grę? Twój obecny wynik nie zostanie zapisany, a jeśli grasz ze znajomymi - zostaniesz oznaczony jako 'Wyszedł'.";
    
    const onConfirm = () => {
        if (typeof timerInterval !== 'undefined' && timerInterval) clearInterval(timerInterval);
        state.isGameActive = false;
        
        if (window.isMultiplayer) {
            if (window.multiplayerLeaveLobby) window.multiplayerLeaveLobby();
        } else {
            showMenu();
        }
    };
    
    const onCancel = () => {
        if (typeof window.pauseGameTimer === 'function') window.pauseGameTimer(false);
    };

    if (window.showCustomConfirm) {
        window.showCustomConfirm(msg, onConfirm, onCancel);
    } else {
        if (confirm(msg)) onConfirm();
        else onCancel();
    }
}

// Global Exports
window.showView = showView;
window.showMenu = showMenu;
window.initGame = initGame;
window.useLifeline = useLifeline;
window.handleAnswer = handleAnswer;
window.leaveGameEarly = leaveGameEarly;

})();
