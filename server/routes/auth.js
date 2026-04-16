const express = require('express');
const router = express.Router();
const QuizUser = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'RAPQUIZ_PROD_SECRET_KEY';

// Lista zakazanych słów (Polish Profanity Filter)
const POLISH_BAD_WORDS = [
    'kurwa', 'chuj', 'jebac', 'jebać', 'pizda', 'pizdzielec', 'pizdziel', 'jebie', 
    'skurwiel', 'skurwysyn', 'huj', 'cipa', 'pizd', 'jeb', 'kutas', 'pedal', 'pedał'
];

function containsBadWord(text) {
    const lowText = text.toLowerCase();
    return POLISH_BAD_WORDS.some(word => lowText.includes(word));
}

// Rejestracja (nick + hasło)
router.post('/register', async (req, res) => {
    try {
        const { username, password, security_answer } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Podaj nick i hasło.' });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ success: false, message: 'Nick musi składać się z minimum 3 znaków.' });
        }

        // Profanity Check
        if (containsBadWord(username)) {
            return res.status(400).json({ success: false, message: 'Nick zawiera słowa uznane za niedozwolone.' });
        }

        // Case-insensitive check
        const existingUser = await QuizUser.findOne({ username: new RegExp('^' + username + '$', 'i') });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Gracz o takim nicku już istnieje.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new QuizUser({
            username,
            password: hashedPassword,
            security_answer: security_answer ? await bcrypt.hash(security_answer, salt) : null
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ user_id: savedUser._id, username: savedUser.username }, JWT_SECRET, { expiresIn: '14d' });

        res.json({
            success: true,
            message: 'Konto utworzone pomyślnie!',
            token,
            user: { username: savedUser.username, profile: savedUser.profile }
        });

    } catch (error) {
        console.error('Błąd rejestracji:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera podczas rejestracji.' });
    }
});

// Logowanie
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await QuizUser.findOne({ username: new RegExp('^' + username + '$', 'i') });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Błędny nick lub hasło.' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ success: false, message: 'Błędny nick lub hasło.' });
        }

        const token = jwt.sign({ user_id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '14d' });

        res.json({
            success: true,
            message: 'Zalogowano pomyślnie.',
            token,
            user: { username: user.username, profile: user.profile }
        });

    } catch (error) {
        console.error('Błąd logowania:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera podczas logowania.' });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ success: false, message: 'Brak tokenu' });
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await QuizUser.findById(decoded.user_id);
        if (!user) return res.status(404).json({ success: false, message: 'Nie znaleziono gracza' });
        
        res.json({ success: true, username: user.username, profile: user.profile });
    } catch(err) {
        res.status(401).json({ success: false, message: 'Nieważny token' });
    }
});

module.exports = router;
