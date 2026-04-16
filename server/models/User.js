const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: { 
        type: String, 
        required: true 
    },
    // Brak emaila - system bezpieczny przez opcjonalne pytanie pomocnicze
    security_question: { type: String, default: 'Jaki był Twój pierwszy rapowy idol?' },
    security_answer: { type: String, required: false },
    role: { type: String, default: 'player' },
    created_at: { type: Date, default: Date.now },
    
    // Zagnieżdżony profil gracza ułatwia przechowywanie mniejszej ilości danych w grze Quizowej
    profile: {
        score: { type: Number, default: 0 },        // najlepszy wynik (single game)
        total_score: { type: Number, default: 0 },  // suma punktów ze wszystkich gier
        games_played: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        perfect_streaks: { type: Number, default: 0 },
        correct_answers: { type: Number, default: 0 },
        wrong_answers: { type: Number, default: 0 },
        tournaments_won: { type: Number, default: 0 },
        multiplayer_wins: { type: Number, default: 0 },
        weekly_scores: { type: Map, of: Number, default: {} },
        monthly_scores: { type: Map, of: Number, default: {} },
        achievements: [{ type: String }],
        // Statystyki zapamiętanych kół ratunkowych
        lifelines_used: {
            fifty_fifty: { type: Number, default: 0 },
            phone: { type: Number, default: 0 },
            audience: { type: Number, default: 0 },
            skip: { type: Number, default: 0 }
        }
    }
}, { collection: 'quiz_users' });

module.exports = mongoose.model('QuizUser', UserSchema);
