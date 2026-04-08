# 🗓️ RAPQUIZ — Plan Deweloperski

> Ostatnia aktualizacja: 2026-03-24

---

## ✅ Status ogólny

- [x] Faza 0: Opis projektu i dokumentacja
- [ ] Faza 1: Projekt & Dane
- [ ] Faza 2: Pytania (baza wiedzy)
- [ ] Faza 3: Mechanika Solo
- [ ] Faza 4: Multiplayer
- [ ] Faza 5: Codzienne Wyzwanie
- [ ] Faza 6: Turniej
- [ ] Faza 7: Szlif końcowy

---

## FAZA 1 — Projekt & Dane (2–3 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 1.1 | Struktura katalogów projektu | 1h | [x] |
| 1.2 | Menu główne HTML+CSS+animacje (5 przycisków, 3 kolumny) | 3–4h | [x] |
| 1.3 | System kont: nick + hasło (Node.js + JWT + MongoDB) | 4–6h | [x] |
| 1.4 | Tabela wyników + panel boczny | 2h | [x] |
| 1.5 | API premier muzycznych (Last.fm) — lewy panel | 3h | [x] |

---

## FAZA 2 — Pytania (7–14 dni, NAJDŁUŻSZA FAZA)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 2.1 | Format JSON pytań + walidacja | 1h | [x] |
| 2.2 | Pytania 1990–2000 (min. 100, docelowo 500) | ~2–7 dni | [x] |
| 2.3 | Pytania 2000–2010 (min. 100, docelowo 500) | ~2–7 dni | [x] |
| 2.4 | Pytania 2010–teraz (min. 100, docelowo 500) | ~2–7 dni | [x] |
| 2.5 | Redakcja i weryfikacja pytań | ~2–3 dni | [ ] |

> **Na start: 150 pytań na kategorię (~600 łącznie). Z pomocą AI można zejść do 2–4 dni na wszystkie kategorie.**

### Format JSON pytania:
```json
{
  "id": 1,
  "category": "1990-2000",
  "difficulty": "medium",
  "question": "Który utwór Kalibra 44 zawiera słynną linijkę 'Jestem z miasta, gdzie słońce...'?",
  "answers": ["Jestem bogiem", "Cała sala śpiewa z nami", "Muzyka poważna", "Widzę ich"],
  "correct": 0,
  "tags": ["kaliber44", "slask", "tekst"],
  "hint": "Ten album zmienił wszystko w polskim rapie w 1998 roku..."
}
```

---

## FAZA 3 — Mechanika Solo (4–5 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 3.1 | Ekran przed-grą (nick, wybór kategorii) | 2h | [x] |
| 3.2 | Silnik pytań: losowanie, timer 20s, odpowiedzi | 5–6h | [x] |
| 3.3 | 3 koła ratunkowe + skip | 3–4h | [x] |
| 3.4 | Punktacja + streak bonusy | 2h | [x] |
| 3.5 | Ekran końcowy + zapis do rankingu | 2h | [x] |

### Detale koła ratunkowego:
- **💡 50/50** — usuwa 2 złe odpowiedzi
- **📞 ZADZWOŃ DO KOLEGÓW** — wyświetla fragment tekstu piosenki jako hint
- **📊 GŁOSOWANIE PUBLICZNOŚCI** — symulacja % głosów (klimat "Milionerów")
- **⏭️ SKIP** — 1 raz na całą grę, 0 punktów za pytanie

---

## FAZA 4 — Multiplayer (4–6 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 4.1 | Serwer Node.js + socket.io | 4h | [ ] |
| 4.2 | Tworzenie pokoju / dołączanie po kodzie (format `RAP-XXX`) | 4h | [ ] |
| 4.3 | Synchronizacja pytań i timerów między graczami | 6–8h | [ ] |
| 4.4 | Ekran wyników 20 rund + ekran końcowy | 2h | [ ] |

---

## FAZA 5 — Codzienne Wyzwanie (1–2 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 5.1 | 10 pytań dziennie (seed dzienny, takie same dla wszystkich) | 3h | [ ] |
| 5.2 | Globalny ranking dzienny — reset o północy | 3h | [ ] |
| 5.3 | Blokada: raz dziennie na konto | 1h | [ ] |

---

## FAZA 6 — Turniej (2–3 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 6.1 | Tworzenie turnieju 8/16 graczy + kod zaproszenia | 4h | [ ] |
| 6.2 | Bracket — parowanie i awansowanie zwycięzców | 5–6h | [ ] |
| 6.3 | Panel drabinki turniejowej | 3h | [ ] |

---

## FAZA 7 — Szlif Końcowy (2–3 dni)

| # | Zadanie | Czas | Status |
|---|---------|------|--------|
| 7.1 | Odznaki / osiągnięcia (5 typów) | 4h | [ ] |
| 7.2 | PWA — instalowalna apka, offline cache pytań | 3h | [ ] |
| 7.3 | Fun fakty co 10 pytań | 1h | [ ] |
| 7.4 | Testy, bugfixy, mobile responsiveness | 1–2 dni | [ ] |

---

## ⏱️ Łączny Szacunek Czasu

| Co | Czas |
|---|---|
| Kod (frontend + backend) | ~3–4 tygodnie |
| Pytania (generowanie + weryfikacja) | ~1–2 tygodnie (z AI krócej) |
| Testy + poprawki | ~1 tydzień |
| **RAZEM (solo dev, kilka h dziennie)** | **~5–7 tygodni** |

---

## 📝 Notatki

- Priorytet: najpierw Solo mode działa w pełni → potem multiplayer
- Pytania mogą być generowane stopniowo — minimum viable = 100 na kategorię
- Backend można oprzeć na RRBT (reużyć serwer Node.js + MongoDB)
- Koła ratunkowe muszą być zablokowane po jednorazowym użyciu i zapisywać stan
