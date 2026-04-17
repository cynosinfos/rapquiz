# 🎤 RAPQUIZ — Quiz o Polskim Rapie

> **Status**: Faza planowania — marzec 2026
> **Gra webowa** — przeglądarkowy quiz wiedzy o historii, artystach i tekstach polskiego hip-hopu

---

## 🗺️ Struktura ekranów

### 1. Menu Główne (`index.html`)

```
┌────────────────────────────────────────────────────────────────┐
│  🎵 Najnowsze premiery      ║   ██ RAPQUIZ ██   ║  🏆 TOP GRACZE │
│  (ostatni tydzień)         ║                    ║               │
│                            ║  [▶ START]         ║  NICK  PTS 💡 │
│  • Otsochodzi - XXX        ║  [🔴 UTWÓRZ POKÓJ] ║  PejHan 980 🔲│
│  • Mata - YYY              ║  [📅 COD. WYZWANIE] ║  Grubson 870 🔲│
│  • Quebonafide - ZZZ       ║  [🏆 TURNIEJ]       ║  Tede  830 💡 │
│  ...                       ║  [ℹ️  INFO]         ║  ...          │
└────────────────────────────────────────────────────────────────┘
```

**Lewa kolumna** — Najnowsze premiery rapowe (ostatnie 7 dni)
- Pobierane z zewnętrznego API (Last.fm / Spotify API)
- Wyświetlane jako lista: artysta, tytuł, data premiery, okładka
- Możliwość kliknięcia → link do Spotify/YouTube

**Środek** — Logo + 5 przycisków akcji:
```
[▶ START]  [🔴 UTWÓRZ POKÓJ]  [📅 COD. WYZWANIE]  [🏆 TURNIEJ]  [ℹ️ INFO]
```

**Prawa kolumna** — Tabela najlepszych wyników
| NICK | WYNIK | KOŁA RATUNKOWE |
|------|-------|----------------|
| PejHan | 980 | 💡🔲📞 |
| Grubson | 870 | 💡🔲 |

Kolumna "Koła ratunkowe" pokazuje ikony użytych przez gracza lifelines (im więcej oszczędził → bardziej prestiżowo)

---

## 🎮 Tryb Solo — START

### Ekran przed grą
1. Gracz wpisuje **nick** (3–20 znaków)
2. Gracz wybiera **kategorię**:

| Kategoria | Opis | Pytania |
|-----------|------|---------|
| 🕰️ 1990–2000 | Pionierzy: Liroy, Wzgórze Ya Pa 3, Kaliber 44 | 500 |
| 🔥 2000–2010 | Złota era: Paktofonika, O.S.T.R., Slums Attack | 500 |
| 🎧 2010–teraz | Nowa fala: Mata, Taco Hemingway, Otsochodzi | 500 |
| 🌍 WSZYSTKO | Mix ze wszystkich epok | 1500 |

### Mechanika rozgrywki Solo
- Gra toczy się **do 2 błędnych odpowiedzi** (po 2. błędzie → koniec)
- Każde pytanie: **4 odpowiedzi, 1 prawidłowa**
- Czas na odpowiedź: **20 sekund** (pasek odliczający, napięcie rośnie gdy < 5 sek.)

### Punktacja Solo
| Akcja | Punkty |
|-------|--------|
| Odpowiedź prawidłowa (≤5 sek.) | 100 pkt |
| Odpowiedź prawidłowa (6–10 sek.) | 80 pkt |
| Odpowiedź prawidłowa (11–20 sek.) | 60 pkt |
| Seria 5 poprawnych z rzędu (streak) | +50 pkt bonus |
| Seria 10 poprawnych z rzędu | +150 pkt bonus |
| Pominięcie pytania | 0 pkt |
| Błędna odpowiedź | 0 pkt |

---

## 🆘 Koła ratunkowe

| Symbol | Nazwa | Działanie |
|--------|-------|-----------|
| **💡 50/50** | Pół na pół | Usuwa 2 złe odpowiedzi, zostają 2 |
| **📞 ZADZWOŃ DO KOLEGÓW** | Wskazówka tekstowa | Wyświetla poetycką podpowiedź (fragment tekstu piosenki) |
| **📊 GŁOSOWANIE PUBLICZNOŚCI** | Głos tłumu | Wyświetla fałszywy pasek procentowy głosów (symulacja klimatu) |
| **⏭️ POMIŃ PYTANIE** | Skip | Pytanie przeskoczone bez punktów — **tylko raz na całą grę** |

Każde koło ratunkowe można użyć **max 1 raz**.

---

## 🔴 Tryb Multiplayer — UTWÓRZ POKÓJ

### Tworzenie pokoju
- Gracz 1 tworzy pokój → dostaje **6-znakowy kod** (np. `RAP-447`)
- Gracz 2 wpisuje kod → dołącza do pokoju
- Host wybiera kategorię → obaj potwierdzają „GOTOWY"
- Gra startuje przy `2/2 READY`

### Mechanika Multiplayer
- **20 rund** — każda runda = 1 pytanie dla obu graczy jednocześnie
- Czas na odpowiedź: **15 sekund** (szybciej = więcej punktów)
- Na końcu każdej rundy wyświetla się mini-wynik rundy

### Punktacja Multiplayer (per runda)
| Sytuacja | Gracz A | Gracz B |
|----------|---------|---------| 
| Obaj odpowiedzieli prawidłowo | Szybszy +2 pkt, wolniejszy +1 pkt | — |
| Tylko jeden odpowiedział prawidłowo | +3 pkt | 0 pkt |
| Obaj błąd | 0 pkt | 0 pkt |
| Szybka odpowiedź (< 5 sek.) | +1 pkt bonus | — |

### Ekran końcowy Multiplayer
```
╔══════════════════════════════╗
║     KONIEC MECZU 🎤          ║
║  PejHan    vs    Grubson     ║
║    42 pkt  |||  38 pkt       ║
║  Trafione: 14/20  11/20      ║
║  🏆  WYGRYWA PEJHAN! 🏆      ║
╚══════════════════════════════╝
```

---

## 📅 Codzienne Wyzwanie

- **10 pytań dziennie** — takich samych dla wszystkich graczy (seed dzienny)
- **Globalny ranking dzienny** — reset o północy
- **Blokada**: raz dziennie na konto
- Pozwala porównać się ze wszystkimi graczami danego dnia

---

## 🏆 Tryb Turniej

- Organizator tworzy bracket **8 lub 16 graczy** + kod zaproszenia
- System automatycznie paruje i awansuje zwycięzców
- Panel drabinki turniejowej widoczny dla wszystkich uczestników
- Spectator mode — możliwość oglądania meczów na żywo

---

## 🏅 System odznak (Achievements)

| Odznaka | Warunek |
|---------|---------| 
| 🎙️ MC ROOKIE | Pierwsze 10 pytań |
| 🏆 ZŁOTA ERA | 50 pytań z kategorii 2000–2010 bez błędu |
| 💎 DIAMOND DISC | 500 pkt w jednej sesji |
| 🤫 MILCZĄCY ŚWIADEK | Ukończ grę bez użycia ANI JEDNEGO koła ratunkowego |
| ⚡ FREESTYLE KING | 10 odpowiedzi z rzędu w czasie < 5 sek. |

---

## 🎨 Wizualne i klimatyczne

- **Dynamiczne tło** — kasety, gramofony, sprayowe graffiti, animowane VHS-owate przebarwienia
- **Styl UI** — dark mode z neonowymi akcentami (żółty/złoty, fioletowy, biały)
- **Dźwięki** — beat hip-hopowy w tle menu, dźwięk bitu gdy odpowiedź prawidłowa, „scratching" przy błędzie
- **Avatary** — sylwetki w stylu graffy (stickman w czapeczce)

---

## 💡 Dodatkowe funkcje

- **PWA** — możliwość instalacji na telefonie jako apka (offline mode z pytaniami z cache)
- **Historia gier** — profil gracza z historią ostatnich 10 sesji
- **Filtr trudności** — łatwe / średnie / hardkorowe
- **Fun fakty** — co 10. odpowiedzi losowa ciekawostka o polskim rapie

---

## 🔑 System Kont — Nick + Hasło

- **Rejestracja**: unikalny nick + hasło (zahaszowane bcrypt) — bez emaila
- **Logowanie**: nick + hasło → JWT w localStorage
- **Odzyskiwanie hasła** — przez pytanie bezpieczeństwa (brak emaila)
- **Profil gracza**: nick, wyniki, odznaki, historia gier, data rejestracji

---

## 🛠️ Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Real-time (multiplayer) | WebSockets (`socket.io`) |
| Baza danych pytań | JSON pliki (lokalnie) |
| Auth & Rankings | Node.js + bcrypt + JWT + MongoDB |
| Premiery muzyczne | Last.fm API lub Spotify API |
| Hosting | Render.com |

---

## 📁 Struktura projektu

```
RAPQUIZ/
├── index.html              # Menu główne
├── css/
│   └── style.css
├── js/
│   ├── menu.js             # Logika menu, ranking
│   ├── game.js             # Mechanika solo quiz
│   ├── multiplayer.js      # Logika WebSocket
│   ├── lifelines.js        # Koła ratunkowe
│   └── data/
│       ├── questions_1990_2000.json
│       ├── questions_2000_2010.json
│       └── questions_2010_now.json
├── assets/
│   ├── sounds/
│   └── images/
├── server/
│   └── server.js           # Node.js + socket.io (multiplayer)
├── manifest.json           # PWA manifest
├── service-worker.js       # PWA offline cache
└── README.md
```
