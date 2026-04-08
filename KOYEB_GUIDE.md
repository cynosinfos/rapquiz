# 🚀 Instrukcja: Deployment RAPQUIZ na Koyeb

Koyeb to świetna darmowa alternatywa dla Rendera. Poniżej znajdziesz kroki, jak przenieść tam swoją grę i podpiąć domenę `rapq.pl`.

## 1. Przygotowanie Konta
1. Zarejestruj się na [Koyeb.com](https://www.koyeb.com/).
2. Połącz swoje konto z GitHubem.

## 2. Tworzenie Serwisu (Web Service)
1. Kliknij **"Create Service"**.
2. Wybierz **GitHub** jako źródło.
3. Wybierz swoje repozytorium `rapquiz`.
4. W sekcji **"Branch"** wybierz `main`.
5. W sekcji **"Builder"** upewnij się, że wybrano **Buildpack** (Koyeb sam wykryje Node.js).
6. **Zmienne środowiskowe (Environment Variables)**:
   Kliknij "Add Variable" i dodaj:
   - `MONGODB_URI` — wklej swój link do MongoDB Atlas (pamiętaj o nowej nazwie bazy `rapquiz_db` na końcu linku!).
   - `NODE_ENV` — ustaw na `production`.
   - `JWT_SECRET` — wymyśl długi, losowy ciąg znaków (np. `MojeSuperTajneHaslo123!`).
7. **Port**: Koyeb domyślnie nasłuchuje na porcie `8000`, ale Twój serwer używa `process.env.PORT`. To zadziała automatycznie.

## 3. Podpięcie domeny rapq.pl (z home.pl)
1. W panelu Koyeb wejdź w ustawienia serwisu -> **Domains**.
2. Dodaj swoją domenę `rapq.pl`.
3. Koyeb poda Ci rekordy DNS, które musisz wpisać w panelu **home.pl**:
   - Zazwyczaj jest to rekord **CNAME** kierujący na adres Twojej aplikacji na koyeb (np. `xyz.koyeb.app`).
4. Po dodaniu rekordów w home.pl, odczekaj od kilku minut do godziny na odświeżenie DNS. Koyeb automatycznie wygeneruje darmowy certyfikat **SSL (HTTPS)**.

---

## 🔍 Wynik Skanu: Czy Multiplayer będzie działać?

**TAK.** Skan projektu potwierdził:
1. **Socket.io**: Serwer jest gotowy na połączenia z zewnątrz (`0.0.0.0`).
2. **Porty**: Dynamiczne przypisywanie portu przez Koyeb jest wspierane.
3. **Klient**: Skrypt `js/multiplayer.js` w linijce 1 poprawnie wykrywa środowisko produkcyjne i łączy się z głównym hostem aplikacji.

---

## ✅ Wdrożone zmiany: Filtr Wulgaryzmów
Wprowadziłem do pliku `server/routes/auth.js` filtr najczęstszych polskich wulgaryzmów. 
- Podczas rejestracji system sprawdzi, czy Nick nie zawiera zakazanych słów.
- Jeśli ktoś spróbuje użyć słowa na "k" lub "j", otrzyma komunikat: *"Nick zawiera słowa uznane za niedozwolone."*

### Gotowe do wrzucenia na GitHub i Koyeb! 🚀
