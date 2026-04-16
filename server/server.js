require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const fs = require('fs');
const path = require('path');
let RAPQUIZ_QUESTIONS = {};
try {
  const content = fs.readFileSync(path.join(__dirname, '../js/data/questions.js'), 'utf8');
  const jsonStr = content.replace('const RAPQUIZ_QUESTIONS = ', '').replace(/;\s*$/, '');
  RAPQUIZ_QUESTIONS = JSON.parse(jsonStr);
} catch(e) { console.error("Error loading questions in server:", e); }

// State handled purely by rooms

// ── MULTIPLAYER STATE ──
const rooms = {};  // Kody pokoi -> info

// Socket.io setup dla przyszłego multiplayer'a
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const rankingRoutes = require('./routes/ranking');

app.use('/api/auth', authRoutes);
app.use('/api/ranking', rankingRoutes);

// Serwowanie statycznych plików frontendu (HTML, CSS, JS, obrazy)
app.use(express.static(path.join(__dirname, '../')));

// Daily Challenge in-memory state
const dailyRankings = {}; // { 'YYYY-MM-DD': { 'username': score } }

app.get('/api/daily/status', (req, res) => {
    const user = req.query.user;
    const date = new Date().toISOString().split('T')[0];
    const played = dailyRankings[date] ? (dailyRankings[date][user] !== undefined) : false;
    res.json({ success: true, played: played, date: date });
});

app.post('/api/daily/submit', (req, res) => {
    const { username, score } = req.body;
    const date = new Date().toISOString().split('T')[0];
    if (!dailyRankings[date]) dailyRankings[date] = {};
    if (dailyRankings[date][username] === undefined) {
         dailyRankings[date][username] = score;
    }
    res.json({ success: true, message: 'Wynik zapisany' });
});

app.get('/api/daily/ranking', (req, res) => {
    let date = req.query.date;
    if (!date) date = new Date().toISOString().split('T')[0];
    
    if (!dailyRankings[date]) return res.json({ success: true, data: [] });
    
    const sorted = Object.keys(dailyRankings[date])
        .map(u => ({ nick: u, score: dailyRankings[date][u] }))
        .sort((a,b) => b.score - a.score)
        .slice(0, 10);
    res.json({ success: true, data: sorted });
});

// Schema do pytań graczy
const pendingQuestionSchema = new mongoose.Schema({
    question: String,
    category: String,
    answers: [String],
    correct: Number,
    hint: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
});
const PendingQuestion = mongoose.model('PendingQuestion', pendingQuestionSchema);

app.post('/api/questions/submit', async (req, res) => {
    try {
        const qData = req.body;
        const newQuestion = new PendingQuestion(qData);
        await newQuestion.save();
        res.json({ success: true });
    } catch (e) {
        console.error("Błąd zapisu pytania do DB:", e);
        res.status(500).json({ success: false, message: 'Błąd bazy danych' });
    }
});

// GET /api/questions/pending - PODGLĄD PROPOZYCJI OD GRACZY
app.get('/api/questions/pending', async (req, res) => {
    try {
        const questions = await PendingQuestion.find({}).sort({ timestamp: -1 });
        // Zwracamy w formacie czytelnym (JSON), który łatwo skopiować
        res.json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (e) {
        console.error("Błąd pobierania pytań:", e);
        res.status(500).json({ success: false, message: 'Błąd bazy danych' });
    }
});

// Baza danych MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rapquiz_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Połączono z MongoDB (RAPQUIZ).'))
  .catch(err => console.error('❌ Błąd połączenia z MongoDB:', err));

// Testowy endpoint z diagnostyką bazy danych
app.get('/health', async (req, res) => {
    try {
        const stateMapping = { 0: 'Odłączono (Brak łącza z bazą!)', 1: 'Połączono (Connected) ✅', 2: 'W trakcie łączenia (Connecting...)', 3: 'Rozłączanie...' };
        const dbStateCode = mongoose.connection.readyState;
        const dbStateText = stateMapping[dbStateCode] || 'Nieznany Status';
        
        let dbPing = 'Niedostępny';
        if (dbStateCode === 1) {
            await mongoose.connection.db.admin().ping();
            dbPing = 'Sukces (Baza odpowiada poprawnie)';
        }
        
        res.json({ 
            status: 'ok', 
            message: 'Serwer Gier RAPQUIZ działa poprawnie.',
            mongodb_connection: dbStateText,
            mongodb_ping_test: dbPing
        });
    } catch(err) {
        res.status(500).json({ error: 'Błąd serwera', details: err.message });
    }
});

// ── STRONY STATYCZNE (AdSense) ──
app.get('/kontakt', (req, res) => {
  res.sendFile(path.join(__dirname, '../kontakt.html'));
});

app.get('/o-projekcie', (req, res) => {
  res.sendFile(path.join(__dirname, '../o-projekcie.html'));
});

// ── FORMULARZ KONTAKTOWY ──
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;
    if (!name || !message || message.length < 10) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowe dane formularza.' });
    }
    // Logujemy wiadomość do konsoli (można podłączyć e-mail lub bazę)
    console.log(`📩 [KONTAKT] Od: ${name} <${email || 'brak'}> | Temat: ${topic} | Wiad: ${message.slice(0, 100)}`);
    res.json({ success: true });
  } catch (e) {
    console.error('Błąd /api/contact:', e);
    res.status(500).json({ success: false });
  }
});

// Wszystkie inne żądania (nie-API) przekierowujemy do index.html
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Zdarzenia Socket.io
io.on('connection', (socket) => {
  console.log(`📡 Nowy gracz połączony: ${socket.id}`);
    
    // --- TURNIEJE (IGRZYSKA BATTLE ROYALE) ---
    socket.on('create_tournament', (data) => {
        let code;
        do { code = 'TRN-' + Math.floor(100 + Math.random() * 900); } while (rooms[code]);
        rooms[code] = {
            id: code, hostId: socket.id, hostName: data.username,
            players: [{id: socket.id, name: data.username}],
            state: 'waiting', isTourney: true
        };
        socket.join(code);
        socket.emit('room_created', { roomCode: code, players: rooms[code].players, isTourney: true });
    });

    socket.on('join_tournament', (data) => {
        const room = rooms[data.code];
        if (!room || !room.isTourney) return socket.emit('room_error', 'Turniej o tym kodzie nie istnieje.');
        if (room.players.length >= 20) return socket.emit('room_error', 'Turniej jest pełen (max 20).');
        if (room.state !== 'waiting') return socket.emit('room_error', 'Turniej już wystartował.');
        
        room.players.push({id: socket.id, name: data.username});
        socket.join(data.code);
        
        socket.emit('room_joined', { roomCode: data.code, hostName: room.hostName, players: room.players, isTourney: true });
        io.to(data.code).emit('player_joined', { players: room.players });
    });

    // --- POKOJE MULTIPLAYER LOBBY ---
  
  socket.on('create_room', (data) => {
     let code;
     do { code = 'RAP-' + Math.floor(100 + Math.random() * 900); } while(rooms[code]);
     
     rooms[code] = {
         id: code,
         hostId: socket.id,
         hostName: data.username,
         players: [{id: socket.id, name: data.username}],
         state: 'waiting'
     };
     socket.join(code);
     socket.emit('room_created', { roomCode: code, players: rooms[code].players });
  });

  socket.on('join_room', (data) => {
     const room = rooms[data.roomCode];
     if (!room) return socket.emit('room_error', 'Nie znaleziono pokoju o tym kodzie.');
     if (room.players.length >= 10) return socket.emit('room_error', 'Pokój jest pełny (max 10).');
     if (room.state !== 'waiting') return socket.emit('room_error', 'Gra w tym pokoju już trwa.');
     
     room.players.push({id: socket.id, name: data.username});
     socket.join(data.roomCode);
     
     socket.emit('room_joined', { roomCode: data.roomCode, hostName: room.hostName, players: room.players });
     io.to(data.roomCode).emit('player_joined', { players: room.players });
  });

  socket.on('start_multiplayer_game', (data) => {
     const room = rooms[data.roomCode];
     if(room && room.hostId === socket.id && room.players.length >= 2 && room.state === 'waiting') {
         room.state = 'playing';
         room.category = data.category;
         
         let pool = [];
         if (room.category === 'wszystko') {
             Object.values(RAPQUIZ_QUESTIONS).forEach(arr => pool = pool.concat(arr));
         } else {
             pool = [...(RAPQUIZ_QUESTIONS[room.category] || [])];
         }
         
         pool.sort(() => Math.random() - 0.5);
         room.questions = pool.slice(0, 20);
         room.currentRound = -1;
         
         room.scores = {};
         room.players.forEach(p => {
             room.scores[p.id] = 0;
             p.alive = true;
         });
         room.answersThisRound = {};
         
         io.to(room.id).emit('game_started', { players: room.players, isTourney: room.isTourney });
         setTimeout(() => startNextRound(room), 2000);
     }
  });

  function startNextRound(room) {
      if(!rooms[room.id]) return;
      room.currentRound++;
      if (room.currentRound >= room.questions.length || room.currentRound >= 20) {
          endMultiplayerGame(room);
          return;
      }
      
      room.answersThisRound = {};
      const q = room.questions[room.currentRound];
      io.to(room.id).emit('next_question', { question: q.question, answers: q.answers });
      
      room.roundTimer = setTimeout(() => { evaluateRound(room); }, 15500);
  }

  socket.on('submit_answer', (data) => {
      const room = rooms[data.roomCode];
      if (room && room.state === 'playing') {
          room.answersThisRound[socket.id] = { answerIndex: data.answerIndex, timeLeft: data.timeLeft };
          
          const activePlayers = room.players.filter(p => !p.disconnected);
          let allAnswered = true;
          for (let p of activePlayers) {
              if (!room.answersThisRound[p.id]) { allAnswered = false; break; }
          }
          
          if (allAnswered) {
              clearTimeout(room.roundTimer);
              evaluateRound(room);
          }
      }
  });

  function evaluateRound(room) {
      const q = room.questions[room.currentRound];
      const results = { correctIndex: q.correct };
      
      let correctPlayers = room.players.filter(p => {
          if (!p.alive) return false;
          let ans = room.answersThisRound[p.id];
          return ans && ans.answerIndex === q.correct;
      });
      correctPlayers.sort((a,b) => room.answersThisRound[b.id].timeLeft - room.answersThisRound[a.id].timeLeft);

      room.players.forEach(p => {
          if (!p.alive) {
              results[p.id] = { pointsEarned: 0, alive: false };
              return;
          }

          let ans = room.answersThisRound[p.id];
          let pts = 0;
          let pCorrect = ans && ans.answerIndex === q.correct;
          if (pCorrect) {
              pts += 2;
              if (correctPlayers[0] && correctPlayers[0].id === p.id) pts += 1;
              if (ans && ans.timeLeft >= 10) pts += 1;
          } else {
              // IGRZYSKA - błędna odpowiedź lub jej brak to eliminacja
              if (room.isTourney) p.alive = false;
          }
          room.scores[p.id] += pts;
          results[p.id] = { pointsEarned: pts, alive: p.alive };
      });
      
      io.to(room.id).emit('round_results', results);
      
      if (room.isTourney) {
          const aliveCount = room.players.filter(p => p.alive).length;
          if (aliveCount <= 1 || room.currentRound >= room.questions.length - 1) {
              setTimeout(() => endMultiplayerGame(room), 4000);
              return;
          }
      }

      setTimeout(() => startNextRound(room), 4000);
  }

  function endMultiplayerGame(room) {
      room.state = 'ended';
      
      let eligible = room.players;
      if (room.isTourney) {
          const alive = room.players.filter(p => p.alive);
          if (alive.length > 0) eligible = alive;
      }
      
      const sorted = [...eligible].sort((a,b) => room.scores[b.id] - room.scores[a.id]);
      let winnerId = sorted.length > 0 ? sorted[0].id : null;
      if (sorted.length > 1 && room.scores[sorted[0].id] === room.scores[sorted[1].id]) {
          winnerId = 'draw';
      }
      
      io.to(room.id).emit('multiplayer_game_over', { winnerId, scores: room.scores, isTourney: room.isTourney });
      
      delete rooms[room.id];
  }

  function handlePlayerExit(socketId) {
      for (let code in rooms) {
          let r = rooms[code];
          const pIndex = r.players.findIndex(p => p.id === socketId);
          if (pIndex !== -1) {
              if (r.state === 'waiting') {
                  r.players.splice(pIndex, 1);
                  if (r.players.length === 0) {
                      delete rooms[code];
                  } else {
                      if (r.hostId === socketId) {
                          r.hostId = r.players[0].id;
                          r.hostName = r.players[0].name;
                      }
                      io.to(r.id).emit('player_joined', { players: r.players });
                  }
              } else {
                  // Gra trwa
                  r.players[pIndex].alive = false;
                  r.players[pIndex].disconnected = true;
                  if (!r.players[pIndex].name.includes('(Wyszedł)')) {
                      r.players[pIndex].name += " (Wyszedł)";
                  }
                  
                  const activePlayers = r.players.filter(p => !p.disconnected);
                  if (activePlayers.length === 0) {
                      delete rooms[code]; // Wszyscy opuścili pokój
                  } else {
                      // Jeśli opuszczający gracz blokował timer, wymuś sprawdzenie tury
                      if (Object.keys(r.answersThisRound).length >= activePlayers.length) {
                          clearTimeout(r.roundTimer);
                          evaluateRound(r);
                      }
                  }
              }
          }
      }
  }

  socket.on('leave_room', (data) => {
      handlePlayerExit(socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Gracz odłączony: ${socket.id}`);
    handlePlayerExit(socket.id);
  });
});

const PORT = process.env.PORT || 7860;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serwer RAPQUIZ nasłuchuje na porcie ${PORT} (gotowy na LAN)`);
});
