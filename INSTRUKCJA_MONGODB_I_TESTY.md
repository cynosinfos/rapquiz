# INSTRUKCJA: INSTALACJA MONGODB I TESTOWANIE GRY (FAZA 4)

Zatrzymaliśmy się na błędzie logowania z powodu braku uruchomionej lokalnej bazy danych. Oto co musisz zrobić po powrocie:

## 1. Pobranie i Instalacja MongoDB
Serwer Twojej gry wymaga narzędzia zarządzającego bazą danych kont graczy (MongoDB). 
- **Pobierz:** Wejdź na [Oficjalną stronę MongoDB](https://www.mongodb.com/try/download/community) i kliknij zielony przycisk **Download** (wersja dla Windowsa .msi).
- **Zainstaluj:** Przeklikaj instalator upewniając się, że zaznaczysz opcję **"Install MongoDB as a Service"**. Dzięki temu baza danych będzie automatycznie uruchamiać się razem ze startem Twojego komputera, nie wymagając od Ciebie jej późniejszego włączania.

## 2. Odpalenie Serwera po Instalacji Bazy
1. Otwórz terminal w Twoim katalogu projektu gry:
   `c:\Users\Dziubasek\.gemini\antigravity\scratch\RAPQUIZ`
2. Wpisz komendę, by odpalić wirtualny serwer pod portem 4000:
   `npm run start`

## 3. Rejestracja i Właściwa Sesja (Próba Logowania)
1. Gdy serwer działa, wejdź w przeglądarkę i w pole adresu wpisz: `localhost:4000`
2. Kliknij guzik łączenia w stopce gry lub cokolwiek otwierające modal autoryzacji.
3. **WAŻNE:** Jako że przed chwilą bazy danych na Twoim PC zupełnie nie było, po otworzeniu okna logowania przejdź od razu do nowej zakładki **"ZAREJESTRUJ" / "STWÓRZ KONTO"**, wprowadź tam świeży Nick (np. `Dziubasek26`) oraz bezpieczne hasło, i zatwierdź.
4. Odtąd możesz się śmiało poprawnie tam logować. Gratulacje!

## 4. Przetestowanie Multiplayera z Dwóch Kart Przeglądarki
1. Zostaw odpaloną powyższą grę. Otwórz u siebie **Tryb Multiplayer** i utwórz pokój klikając **UTWÓRZ POKÓJ** (otrzymasz kod).
2. Otwórz nowe **Okno Incognito** (tryb prywatny). Przejdź znów na `localhost:4000`. Certyfikaty prywatności udadzą tam kompletnie nowego "Innego Użytkownika".
3. Załóż mu inne konto, wejdź w **DOŁĄCZ DO POKOJU** i przepisz wspomniany uprzednio kod.
4. Na głównej karcie (nie-incognito) wciśnij "START". Rywalizuj sam ze sobą! Skup się na sprawdzeniu, czy przelicznik punktów faworyzujący odpowiedź poniżej 5 sek. oraz sam refleks (+1 pkt) sumują się zgodnie z nowo dodanym systemem rankingowym!

Do zobaczenia i udanego wekendu. Jak ruszysz - czekam w gotowości!
