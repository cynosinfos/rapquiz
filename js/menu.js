/* ================================================================
   menu.js — Logika menu głównego RAPQUIZ
   ================================================================ */

// ── Floating background tags ──────────────────────────────────────
(function initFloatingTags() {
  const container = document.getElementById('floatingTags');
  const tags = [
    'Paktofonika', 'O.S.T.R.', 'Taco Hemingway', 'Mata', 'Quebonafide',
    'Otsochodzi', 'Kaliber 44', 'Slums Attack', 'Liroy', 'Peja',
    'Bedoes', 'White 2115', 'Young Igi', 'Kizo', 'Szpaku',
    'Grubson', 'Tede', 'Solar', 'Kali', 'Żabson',
    '#polska', '#hiphop', '#rap', '#quiz', '#rapquiz',
    '🎤', '🎧', '🎵', '🎙️', '🔥',
  ];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.textContent = tags[Math.floor(Math.random() * tags.length)];
    span.style.top = `${Math.random() * 95}%`;
    span.style.animationDuration = `${14 + Math.random() * 20}s`;
    span.style.animationDelay = `${Math.random() * 18}s`;
    container.appendChild(span);
  }
})();

// ── Footer clock ──────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('footerTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
updateClock();
setInterval(updateClock, 1000);

// ── Mock Ranking ──────────────────────────────────────────────────
const MOCK_RANKING = [
  { nick: 'PejHan',   score: 980, lifelines: '💡🔲📞' },
  { nick: 'Grubson',  score: 870, lifelines: '💡🔲' },
  { nick: 'MC_Tede',  score: 830, lifelines: '💡' },
  { nick: 'RapKing',  score: 790, lifelines: '💡🔲📞⏭️' },
  { nick: 'FlowMstr', score: 740, lifelines: '' },
  { nick: 'Kaliber',  score: 690, lifelines: '📞' },
  { nick: 'Slums99',  score: 650, lifelines: '💡📞' },
  { nick: 'QuizBoy',  score: 610, lifelines: '🔲' },
];

async function renderRanking() {
  const container = document.getElementById('rankingList');
  const posClasses = ['gold', 'silver', 'bronze'];
  
  try {
     const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
     const res = await fetch(`${API_URL}/api/ranking`);
     if (!res.ok) throw new Error('API Ranking Error');
     const json = await res.json();
     if (json.success && json.data && json.data.length > 0) {
        drawRankingHTML(json.data, container, posClasses);
     } else {
        throw new Error('Ranking pęsty z API');
     }
  } catch(err) {
     console.warn('Backend rankingu niedostępny, używam MOCK:', err);
     drawRankingHTML(MOCK_RANKING, container, posClasses);
  }
}

function drawRankingHTML(dataList, container, posClasses) {
  let html = '';
  dataList.forEach((player, i) => {
    const posClass = posClasses[i] || '';
    const initials = player.nick.slice(0, 2).toUpperCase();
    const divider = i < dataList.length - 1 ? '<div class="rank-divider"></div>' : '';
    html += `
      <div class="rank-item">
        <span class="rank-pos ${posClass}">${i + 1}</span>
        <div class="rank-avatar">${initials}</div>
        <div class="rank-info">
          <div class="rank-nick">${player.nick}</div>
          <div class="rank-lifelines" title="Nieużyte koła ratunkowe">${player.lifelines || '<span style="color:var(--text-dim)">brak</span>'}</div>
        </div>
        <span class="rank-score">${player.score}</span>
      </div>
      ${divider}
    `;
  });
  container.innerHTML = html;
}

// ── (ZMODYFIKOWANO: Usunięto sekcję premier) ──

// ── Button actions (stubbed — widoczna pełna logika Auth) ───
function startGame() {
  const token = localStorage.getItem('rapquiz_token');
  if (!token) {
    openAuthModal();
    return;
  }
  alert('🎮 Gra Solo — uruchamianie fazy!');
}

function createRoom() {
  const token = localStorage.getItem('rapquiz_token');
  if (!token) {
    openAuthModal();
    return;
  }
  if (typeof showView === 'function') {
    showView('multiplayerHubView');
  } else {
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('multiplayerHubView').style.display = 'flex';
  }
}

async function dailyChallenge() {
  const token = localStorage.getItem('rapquiz_token');
  const userStr = localStorage.getItem('rapquiz_user');
  if (!token || !userStr) {
    openAuthModal();
    return;
  }
  const user = JSON.parse(userStr);
  
  if(typeof showView === 'function') {
      showView('dailySetupView');
      document.getElementById('dailyDateLabel').textContent = 'Ładowanie...';
  } else {
      document.getElementById('menuView').style.display = 'none';
      document.getElementById('dailySetupView').style.display = 'flex';
  }
  
  try {
     const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
     const res = await fetch(`${API_URL}/api/daily/status?user=${encodeURIComponent(user.username)}`);
     const data = await res.json();
     
     if (data.success) {
         document.getElementById('dailyDateLabel').textContent = data.date;
         const btnStart = document.getElementById('btnStartDaily');
         const errEl = document.getElementById('dailyError');
         
         if(data.played) {
             btnStart.disabled = true;
             btnStart.textContent = "JUŻ GRAŁEŚ DZIŚ!";
             errEl.textContent = "Wróć jutro by sprawdzić nowe pytania i pobić rekord w rankingu.";
         } else {
             btnStart.disabled = false;
             btnStart.textContent = "ODPAL WYZWANIE";
             errEl.textContent = "";
         }
     }
  } catch(err) {
      console.warn('API error, using local fallback', err);
      document.getElementById('dailyDateLabel').textContent = new Date().toISOString().split('T')[0];
      const lastPlay = localStorage.getItem('rapquiz_dailyLastPlay');
      const today = new Date().toISOString().split('T')[0];
      const btnStart = document.getElementById('btnStartDaily');
      const errEl = document.getElementById('dailyError');
      if (lastPlay === today) {
         btnStart.disabled = true;
         btnStart.textContent = "JUŻ GRAŁEŚ DZIŚ!";
         errEl.textContent = "Wróć jutro.";
      } else {
         btnStart.disabled = false;
         btnStart.textContent = "ODPAL WYZWANIE";
         errEl.textContent = "Lokalny tryb awaryjny (brak serwera).";
      }
  }
}

function openTournament() {
  const token = localStorage.getItem('rapquiz_token');
  if (!token) {
    openAuthModal();
    return;
  }
  showView('tournamentHubView');
}

function openInfo() {
  if (typeof showView === 'function') {
    showView('infoView');
  } else {
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('infoView').style.display = 'flex';
  }
}

function shareGame() {
  const shareData = {
    title: 'RAPQUIZ',
    text: 'Sprawdź swoją wiedzę o polskim rapie w RAPQUIZ! Zagraj w trybie Solo lub ze znajomymi w trybie Multiplayer i Turnieju.',
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(err => console.log('Błąd udostępniania:', err));
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Chcesz udostępnić grę? Skopiowano link do strony: ' + window.location.href);
    }).catch(err => alert('Twój link to: ' + window.location.href));
  }
}

function shareScore() {
  const score = document.getElementById('finalScore').textContent;
  const shareData = {
    title: 'Mój wynik w RAPQUIZ',
    text: `Osiągnąłem wynik: ${score} w interaktywnym teście RAPQUIZ! Spróbuj pobić mój rekord!`,
    url: window.location.href
  };
  
  if (navigator.share) {
    navigator.share(shareData).catch(err => console.log('Błąd udostępniania:', err));
  } else {
    navigator.clipboard.writeText(`${shareData.text} Spróbuj tutaj: ${shareData.url}`).then(() => {
      alert('Twój wynik i link do gry skopiowano do schowka! Możesz teraz wkleić go znajomym.');
    });
  }
}

function showSubmitQuestionView() {
    showView('submitQuestionView');
    document.getElementById('sq_status').textContent = '';
}

async function submitUserQuestion() {
    const userStr = localStorage.getItem('rapquiz_user');
    const author = userStr ? JSON.parse(userStr).username : 'Anonim';
    
    const q = document.getElementById('sq_question').value.trim();
    const c = document.getElementById('sq_category').value;
    const a0 = document.getElementById('sq_a0').value.trim();
    const a1 = document.getElementById('sq_a1').value.trim();
    const a2 = document.getElementById('sq_a2').value.trim();
    const a3 = document.getElementById('sq_a3').value.trim();
    const cor = document.getElementById('sq_correct').value;
    const h = document.getElementById('sq_hint').value.trim();
    const status = document.getElementById('sq_status');
    
    if(!q || !c || !a0 || !a1 || !a2 || !a3 || cor === '') {
        status.textContent = 'Wypełnij wszystkie pola (oprócz podpowiedzi)!';
        status.style.color = 'var(--accent-red)';
        return;
    }
    if (q.length < 10) {
        status.textContent = 'Trudno o tak krótkie zapytanie. Rozwiń treść mysli.';
        status.style.color = 'var(--accent-red)';
        return;
    }
    
    document.getElementById('btnSubmitQuestion').disabled = true;
    document.getElementById('btnSubmitQuestion').textContent = 'WYSYŁANIE...';
    
    const payload = { question: q, category: c, answers: [a0, a1, a2, a3], correct: parseInt(cor), hint: h, author };
    
    try {
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
        const res = await fetch(`${API_URL}/api/questions/submit`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if(data.success) {
            status.textContent = 'Wysłano! Dzięki za wkład w rozwój gry rocznik ' + new Date().getFullYear() + '.';
            status.style.color = 'var(--green)';
            document.getElementById('sq_question').value = '';
            document.getElementById('sq_a0').value = ''; document.getElementById('sq_a1').value = '';
            document.getElementById('sq_a2').value = ''; document.getElementById('sq_a3').value = '';
            document.getElementById('sq_hint').value = '';
            document.getElementById('sq_category').value = ''; document.getElementById('sq_category').style.color = 'var(--text-dim)';
            document.getElementById('sq_correct').value = ''; document.getElementById('sq_correct').style.color = 'var(--text-dim)';
        } else {
            status.textContent = 'Błąd podczas wysyłania do bazy.';
            status.style.color = 'var(--accent-red)';
        }
    } catch(err) {
        status.textContent = 'Brak połączenia z siecią. Spróbuj później.';
        status.style.color = 'var(--accent-red)';
    } finally {
        document.getElementById('btnSubmitQuestion').disabled = false;
        document.getElementById('btnSubmitQuestion').textContent = 'WYŚLIJ PROPOZYCJĘ';
    }
}

// ── Auth Modal Logic ───────────────────────────────────────────────
let authMode = 'login'; 

function openAuthModal() {
  document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('authError').textContent = '';
}

function switchAuthTab(mode) {
  authMode = mode;
  document.getElementById('authError').textContent = '';
  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
  document.getElementById('authTitle').textContent = mode === 'login' ? 'LOGOWANIE' : 'REJESTRACJA';
  document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'ZALOGUJ SIĘ' : 'STWÓRZ KONTO';
  document.getElementById('registerExtra').style.display = mode === 'register' ? 'block' : 'none';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const nick = document.getElementById('authNick').value.trim();
  const pass = document.getElementById('authPass').value.trim();
  const secAnswer = document.getElementById('authSecAnswer').value.trim();
  const errorEl = document.getElementById('authError');
  const btn = document.getElementById('authSubmitBtn');
  
  if (nick.length < 3) {
    errorEl.textContent = 'Nick musi mieć min. 3 znaki';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'ŁADOWANIE...';
  
  try {
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login' ? { username: nick, password: pass } : { username: nick, password: pass, security_answer: secAnswer };
    
    // Fallback dla dev (w razie gdy Node nasłuchuje na 4000)
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4000' : '';
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('rapquiz_token', data.token);
      localStorage.setItem('rapquiz_user', JSON.stringify(data.user));
      closeAuthModal();
      checkAuthStatus();
    } else {
      errorEl.textContent = data.message || 'Błąd logowania';
    }
  } catch (err) {
    console.warn('Serwer offline. Włączam lokalny tryb testowy.', err);
    // Wpuszczamy do gry bez backendu (MOCK LOGIN)
    localStorage.setItem('rapquiz_token', 'mock_token_local');
    localStorage.setItem('rapquiz_user', JSON.stringify({ username: nick, profile: { score: 0 } }));
    closeAuthModal();
    checkAuthStatus();
  } finally {
    btn.disabled = false;
    btn.textContent = authMode === 'login' ? 'ZALOGUJ SIĘ' : 'STWÓRZ KONTO';
  }
}

function checkAuthStatus() {
  const token = localStorage.getItem('rapquiz_token');
  const user = JSON.parse(localStorage.getItem('rapquiz_user') || 'null');
  
  const statusEl = document.getElementById('playerStatus');
  const dotEl = document.querySelector('.status-dot');
  
  if (token && user) {
    statusEl.innerHTML = `ONLINE: <span style="color:var(--accent-yellow)">${user.username}</span>`;
    dotEl.style.background = '#00FF41';
    dotEl.style.boxShadow = '0 0 10px #00FF41';
    
    // Update ranking na ten dla zalogowanego (docelowo API)
    // na razie zostaje MOCK
  } else {
    statusEl.textContent = 'OFFLINE - KLIKNIJ ABY ZALOGOWAĆ';
    dotEl.style.background = '#aaaaaa';
    dotEl.style.boxShadow = 'none';
  }
}

function checkAuthAndOpen() {
  const token = localStorage.getItem('rapquiz_token');
  if (!token) {
      openAuthModal();
  } else {
      openProfileModal();
  }
}

async function openProfileModal() {
   document.getElementById('profileModal').style.display = 'flex';
   const userStr = localStorage.getItem('rapquiz_user');
   if(!userStr) return;
   const user = JSON.parse(userStr);
   document.getElementById('profNick').textContent = user.username;
   
   const stats = JSON.parse(localStorage.getItem('rapquiz_stats') || '{"gamesPlayed":0, "highScore":0, "totalScore":0, "badges":[]}');
   document.getElementById('profGames').textContent = stats.gamesPlayed || 0;
   document.getElementById('profHighscore').textContent = stats.highScore || 0;
   const tEl = document.getElementById('profTotalScore');
   if (tEl) tEl.textContent = stats.totalScore || 0;
   
   const badgeKeys = ['rookie', 'zlotaera', 'diamond', 'milczacy', 'freestyle'];
   badgeKeys.forEach(k => {
       const el = document.getElementById('badge_' + k);
       if(stats.badges && stats.badges.includes(k)) {
           el.style.opacity = '1'; el.style.filter = 'none';
       } else {
           el.style.opacity = '0.3'; el.style.filter = 'grayscale(1)';
       }
   });
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    renderRanking();
    // Sekcja premier usunięta z init
});

