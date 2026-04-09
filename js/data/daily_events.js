// Konfiguracja specjalnych wyzwań daily na podane dni
const DAILY_EVENTS = {
    "2026-06-21": {
        theme: "Pierwszy Dzień Lata 🏖️",
        questions: [
            {
                question: "Który kawałek uchodzi za niekwestionowany 'letniak' lat 2000'?",
                answers: ["Jeden Osiem L - Jak zapomnieć", "K.A.S.T.A. - Klimaty", "WWO - Damy radę", "O.S.T.R. - Tabasko"],
                correct: 1, hint: "Związane z gorącymi dniami na osiedlu."
            },
            {
                question: "Kto nawijał w kultowym letnim hicie 'Kobiety są gorące'?",
                answers: ["Norbi", "Liroy", "K.A.S.A.", "Tede"],
                correct: 0, hint: "Prowadził potem popularny teleturniej muzyczny."
            },
            // Tutaj można zdefiniować pełne 10 pytań dla eventu
            // Dla testów uzupełniam resztę kilkoma standardowymi żeby zachować format.
            { question: "Pytanie letnie 3...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 4...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 5...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 6...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 7...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 8...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 9...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
            { question: "Pytanie letnie 10...", answers: ["A", "B", "C", "D"], correct: 0, hint: "" },
        ]
    }
};
