const express = require('express');
const router = express.Router();
const QuizUser = require('../models/User');

// GET /api/ranking
router.get('/', async (req, res) => {
    try {
        // Find top 10 users by TOTAL score (suma ze wszystkich gier)
        const topUsers = await QuizUser.find({}, 'username profile.score profile.total_score profile.lifelines_used')
            .sort({ 'profile.total_score': -1 }) // malejąco wg sumy punktów
            .limit(10);

        // Mapowanie na uproszczony format dla frontendu
        const ranking = topUsers.map(u => {
            let lifelines_str = '';
            // Jesli gracz NIE uzył, to ma ikonkę pokazaną (jako badge of honor w tabeli wg README)
            // Uprośćmy: domyślnie ma wszystkie, usuwamy te użyte.
            // Z dokumentacji wynika, że w tabeli jest kolumna "Koła ratunkowe" 
            // i pokazuje ikony użytych/nieużytych (im więcej oszczędził -> prestiż)
            const lu = u.profile?.lifelines_used || {};
            if (!lu.fifty_fifty) lifelines_str += '💡';
            if (!lu.audience) lifelines_str += '📊';
            if (!lu.phone) lifelines_str += '📞';
            if (!lu.skip) lifelines_str += '⏭️';

            return {
                nick: u.username,
                score: u.profile?.total_score || 0,  // pokazujemy sumę ze wszystkich gier
                lifelines: lifelines_str
            };
        });

        res.json({
            success: true,
            data: ranking
        });

    } catch (error) {
        console.error('Błąd pobierania rankingu:', error);
        res.status(500).json({ success: false, message: 'Błąd pobierania rankingu.' });
    }
});

// POST /api/ranking/save
router.post('/save', async (req, res) => {
    try {
        const { username, score, usedLifelines } = req.body;
        if (!username || typeof score !== 'number') {
            return res.status(400).json({ success: false, message: 'Błędne dane.' });
        }

        const user = await QuizUser.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Zawsze dodajemy do sumy punktów
        user.profile.total_score = (user.profile.total_score || 0) + score;
        user.profile.games_played = (user.profile.games_played || 0) + 1;

        // Aktualizujemy najlepszy wynik jeśli nowy rekord
        if (score > (user.profile.score || 0)) {
            user.profile.score = score;
        }

        // Aktualizacja używanych kół ratunkowych
        if (usedLifelines) {
            if (usedLifelines.fifty_fifty) user.profile.lifelines_used.fifty_fifty = (user.profile.lifelines_used.fifty_fifty || 0) + 1;
            if (usedLifelines.audience)    user.profile.lifelines_used.audience    = (user.profile.lifelines_used.audience || 0) + 1;
            if (usedLifelines.phone)       user.profile.lifelines_used.phone       = (user.profile.lifelines_used.phone || 0) + 1;
            if (usedLifelines.skip)        user.profile.lifelines_used.skip        = (user.profile.lifelines_used.skip || 0) + 1;
        }

        await user.save();
        res.json({ success: true, message: 'Wynik zapisany w MongoDB.' });
    } catch (error) {
        console.error('Błąd zapisu wyniku:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera.' });
    }
});

module.exports = router;
