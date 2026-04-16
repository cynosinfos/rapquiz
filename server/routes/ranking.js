const express = require('express');
const router = express.Router();
const QuizUser = require('../models/User');

// Helper do wyliczania ID czasu
function getWeekId(date) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
}

function getMonthId(date) {
    const d = new Date(date);
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${d.getUTCFullYear()}-${m}`;
}

// GET /api/ranking
router.get('/', async (req, res) => {
    try {
        const { type } = req.query; // 'weekly', 'monthly', or undefined
        
        let sortBy = 'profile.total_score';
        let timeId = null;

        const now = new Date();
        if (type === 'weekly') {
            timeId = getWeekId(now);
            sortBy = `profile.weekly_scores.${timeId}`;
        } else if (type === 'monthly') {
            timeId = getMonthId(now);
            sortBy = `profile.monthly_scores.${timeId}`;
        }
        
        const topUsers = await QuizUser.find({}, `username profile.score profile.total_score profile.lifelines_used profile.weekly_scores profile.monthly_scores`)
            .sort({ [sortBy]: -1 })
            .limit(15);

        const ranking = topUsers.map(u => {
            let lifelines_str = '';
            const lu = u.profile?.lifelines_used || {};
            if (!lu.fifty_fifty) lifelines_str += '💡';
            if (!lu.audience) lifelines_str += '📊';
            if (!lu.phone) lifelines_str += '📞';
            if (!lu.skip) lifelines_str += '⏭️';

            let displayScore = u.profile?.total_score || 0;
            if (type === 'weekly' && u.profile?.weekly_scores) {
                displayScore = u.profile.weekly_scores.get(timeId) || 0;
            } else if (type === 'monthly' && u.profile?.monthly_scores) {
                displayScore = u.profile.monthly_scores.get(timeId) || 0;
            }

            return {
                nick: u.username,
                score: displayScore,
                lifelines: lifelines_str
            };
        });

        // Odrzuc graczy ktorzy w danym okresie maja 0
        const finalRanking = type ? ranking.filter(r => r.score > 0) : ranking;

        res.json({
            success: true,
            data: finalRanking.slice(0, 10)
        });

    } catch (error) {
        console.error('Błąd pobierania rankingu:', error);
        res.status(500).json({ success: false, message: 'Błąd pobierania rankingu.' });
    }
});

// POST /api/ranking/save
router.post('/save', async (req, res) => {
    try {
        const { username, score, usedLifelines, correctAnswers, wrongAnswers, isTourneyWin, isMultiplayerWin } = req.body;
        if (!username || typeof score !== 'number') {
            return res.status(400).json({ success: false, message: 'Błędne dane.' });
        }

        const user = await QuizUser.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.profile.total_score = (user.profile.total_score || 0) + score;
        user.profile.games_played = (user.profile.games_played || 0) + 1;

        if (score > (user.profile.score || 0)) user.profile.score = score;

        if (correctAnswers) user.profile.correct_answers = (user.profile.correct_answers || 0) + correctAnswers;
        if (wrongAnswers) user.profile.wrong_answers = (user.profile.wrong_answers || 0) + wrongAnswers;
        if (isTourneyWin) user.profile.tournaments_won = (user.profile.tournaments_won || 0) + 1;
        if (isMultiplayerWin) user.profile.multiplayer_wins = (user.profile.multiplayer_wins || 0) + 1;

        const now = new Date();
        const weekId = getWeekId(now);
        const monthId = getMonthId(now);

        if (!user.profile.weekly_scores) user.profile.weekly_scores = new Map();
        if (!user.profile.monthly_scores) user.profile.monthly_scores = new Map();

        const currentWeekly = user.profile.weekly_scores.get(weekId) || 0;
        user.profile.weekly_scores.set(weekId, currentWeekly + score);

        const currentMonthly = user.profile.monthly_scores.get(monthId) || 0;
        user.profile.monthly_scores.set(monthId, currentMonthly + score);

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
