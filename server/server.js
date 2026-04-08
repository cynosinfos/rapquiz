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

// ── TOURNAMENTS STATE ──
const tournaments = {}; 

function pushTourneyUpdate(io, code) {
    io.to(code).emit('tourney_update', tournaments[code]);
}

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

// Wszystkie inne żądania (nie-API) przekierowujemy do index.html
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../index.html'));
});

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

// Testowy endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serwer RAPQUIZ działa poprawie.' });
});

// Zdarzenia Socket.io
io.on('connection', (socket) => {
  console.log(`📡 Nowy gracz połączony: ${socket.id}`);
    
    // --- TURNIEJE ---
    socket.on('create_tournament', (data) => {
        let code;
        do { code = 'TRN-' + Math.floor(100 + Math.random() * 900); } while (tournaments[code]);
        
        tournaments[code] = {
            code, hostId: socket.id, state: 'waiting', 
            players: [{id: socket.id, name: data.username}],
            semis: [{p1:null, p2:null, winner:null, room:null}, {p3:null, p4:null, winner:null, room:null}],
            final: {p1:null, p2:null, winner:null, room:null}
        };
        socket.join(code);
        socket.emit('tourney_created', { code, bracket: tournaments[code] });
    });

    socket.on('join_tournament', (data) => {
        const tor = tournaments[data.code];
        if (!tor) return socket.emit('tourney_error', 'Turniej nie istnieje');
        if (tor.state !== 'waiting') return socket.emit('tourney_error', 'Turniej już trwa');
        if (tor.players.length >= 4) return socket.emit('tourney_error', 'Turniej jest pełen (max 4)');
        if (tor.players.find(p => p.id === socket.id)) return;
        
        tor.players.push({id: socket.id, name: data.username});
        socket.join(data.code);
        socket.emit('tourney_joined', { code: data.code, bracket: tor });
        pushTourneyUpdate(io, data.code);
    });

    socket.on('leave_tournament', (data) => {
        const tor = tournaments[data.code];
        if(tor) {
            tor.players = tor.players.filter(p => p.id !== socket.id);
            socket.leave(data.code);
            pushTourneyUpdate(io, data.code);
            if(tor.players.length === 0) delete tournaments[data.code];
        }
    });

    socket.on('start_tournament', (data) => {
        const tor = tournaments[data.code];
        if (!tor || tor.hostId !== socket.id || tor.players.length !== 4) return;
        
        tor.state = 'semis';
        
        const shuffled = [...tor.players].sort(() => 0.5 - Math.random());
        tor.semis[0].p1 = shuffled[0]; tor.semis[0].p2 = shuffled[1];
        tor.semis[1].p1 = shuffled[2]; tor.semis[1].p2 = shuffled[3];
        
        const r1 = 'TM-' + Math.floor(100+Math.random()*900);
        const r2 = 'TM-' + Math.floor(100+Math.random()*900);
        tor.semis[0].room = r1; tor.semis[1].room = r2;
        
        rooms[r1] = { host: tor.semis[0].p1.id, category: data.category, players: [], currentRound:1, questions:[], scores:{}, readyCount:0, state:'waiting', tourney: data.code, tMatch: 'semi_0' };
        rooms[r2] = { host: tor.semis[1].p1.id, category: data.category, players: [], currentRound:1, questions:[], scores:{}, readyCount:0, state:'waiting', tourney: data.code, tMatch: 'semi_1' };
        
        pushTourneyUpdate(io, data.code);
        
        io.to(tor.semis[0].p1.id).emit('tourney_match_start', { roomCode: r1 });
        io.to(tor.semis[0].p2.id).emit('tourney_match_start', { roomCode: r1 });
        io.to(tor.semis[1].p1.id).emit('tourney_match_start', { roomCode: r2 });
        io.to(tor.semis[1].p2.id).emit('tourney_match_start', { roomCode: r2 });
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
     if (room.players.length >= 4) return socket.emit('room_error', 'Pokój jest pełny (max 4).');
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
         room.players.forEach(p => room.scores[p.id] = 0);
         room.answersThisRound = {};
         
         io.to(room.id).emit('game_started', { players: room.players });
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
          if (Object.keys(room.answersThisRound).length === room.players.length) {
              clearTimeout(room.roundTimer);
              evaluateRound(room);
          }
      }
  });

  function evaluateRound(room) {
      const q = room.questions[room.currentRound];
      const results = { correctIndex: q.correct };
      
      let correctPlayers = room.players.filter(p => {
          let ans = room.answersThisRound[p.id];
          return ans && ans.answerIndex === q.correct;
      });
      correctPlayers.sort((a,b) => room.answersThisRound[b.id].timeLeft - room.answersThisRound[a.id].timeLeft);

      room.players.forEach(p => {
          let ans = room.answersThisRound[p.id];
          let pts = 0;
          let pCorrect = ans && ans.answerIndex === q.correct;
          if (pCorrect) {
              pts += 2;
              if (correctPlayers[0].id === p.id) pts += 1;
              if (ans.timeLeft >= 10) pts += 1;
          }
          room.scores[p.id] += pts;
          results[p.id] = { pointsEarned: pts };
      });
      
      io.to(room.id).emit('round_results', results);
      setTimeout(() => startNextRound(room), 4000);
  }

  function endMultiplayerGame(room) {
      room.state = 'ended';
      
      const sorted = [...room.players].sort((a,b) => room.scores[b.id] - room.scores[a.id]);
      let winnerId = sorted[0].id;
      if (room.players.length > 1 && room.scores[sorted[0].id] === room.scores[sorted[1].id]) {
          winnerId = 'draw';
      }
      
      io.to(room.id).emit('multiplayer_game_over', { winnerId, scores: room.scores });
      
      // SPRAWDZANIE TURNIEJU
      if (room.tourney) {
          const tor = tournaments[room.tourney];
          if (tor) {
              const sorted = Object.keys(room.scores).sort((a,b) => room.scores[b] - room.scores[a]);
              const winnerId = sorted[0];
              const winnerName = room.players.find(p => p.socketId === winnerId)?.username || 'Gracz'; // Assuming players array has objects with socketId and username
              
              if(room.tMatch === 'semi_0') tor.semis[0].winner = { id: winnerId, name: winnerName };
              if(room.tMatch === 'semi_1') tor.semis[1].winner = { id: winnerId, name: winnerName };
              
              io.to(room.id).emit('tourney_match_ended', { msg: "Oczekiwanie na resztę drabinki..." });
              pushTourneyUpdate(io, room.tourney);
              
              if(tor.state === 'semis' && tor.semis[0].winner && tor.semis[1].winner) {
                  tor.state = 'final';
                  const f_r = 'TF-' + Math.floor(100+Math.random()*900);
                  tor.final = { p1: tor.semis[0].winner, p2: tor.semis[1].winner, winner: null, room: f_r };
                  rooms[f_r] = { host: tor.final.p1.id, category: room.category, players: [], currentRound:1, questions:[], scores:{}, readyCount:0, state:'waiting', tourney: tor.code, tMatch: 'final' };
                  
                  setTimeout(() => {
                     pushTourneyUpdate(io, tor.code);
                     io.to(tor.final.p1.id).emit('tourney_match_start', { roomCode: f_r });
                     io.to(tor.final.p2.id).emit('tourney_match_start', { roomCode: f_r });
                  }, 5000);
              }
              else if (tor.state === 'final' && room.tMatch === 'final') {
                 tor.final.winner = { id: winnerId, name: winnerName };
                 tor.state = 'done';
                 pushTourneyUpdate(io, room.tourney);
                 io.to(room.id).emit('tourney_match_ended', { msg: "Zwyciężył " + winnerName });
              }
          }
      }
      
      delete rooms[room.id];
  }

  socket.on('leave_room', (data) => {
      const room = rooms[data.roomCode];
      if (room) {
           io.to(room.id).emit('opponent_disconnected');
           delete rooms[room.id];
      }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Gracz odłączony: ${socket.id}`);
    for (let code in rooms) {
        let r = rooms[code];
        if (r.players.find(p => p.id === socket.id)) {
            io.to(r.id).emit('opponent_disconnected');
            delete rooms[code];
        }
    }
  });
});

const PORT = process.env.PORT || 7860;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serwer RAPQUIZ nasłuchuje na porcie ${PORT} (gotowy na LAN)`);
});
