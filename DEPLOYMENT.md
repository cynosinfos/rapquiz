# PLAN WDROŻENIA (DEPLOYMENT): Jak wrzucić RAPQUIZ do sieci

Aby konta użytkowników, drabinki turniejowe, tryb wieloosobowy na żywo i codzienne wyzwania działały poprawnie, aplikację należy uruchomić jako **pełnoprawny serwer aplikacji**, a nie tylko "zwykłą stronę HTML". Serwerem dowodzi tutaj środowisko Node.js.

Najwygodniejszym, w pełni darmowym sposobem będzie wrzucenie całości na platformę **Render.com**. Zapewni to obsługę Socket.io (strumieniowanie na żywo), kont i stabilny adres URL.

## Krok 1: Przygotowanie paczki (Serwowanie statyczne)
Obecnie masz `index.html` na wierzchu i serwer w folderze `/server`. Aby to łatwo udostępnić w internecie w architekturze "wszystko naraz":
1. W pliku `server/server.js`, na samej górze obok `app.use(express.json());` upewnij się, że masz linijkę, która udostępnia stronę w internecie (zaraz za definicją app):
   ```javascript
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../'))); 
   ```
   *(To sprawi, że Node.js sam doręczy Twojego HTML'a graczom)*

2. W pliku `package.json` w sekcji `"scripts"` musisz posiadać komendę startową dla chmury:
   ```json
   "scripts": {
     "start": "node server/server.js",
     "dev": "nodemon server/server.js"
   }
   ```

## Krok 2: Baza danych dla Konta (MongoDB)
Ponieważ chcemy zachować statystyki kont i bezpieczne loginy, konieczna jest zewnętrzna darmowa Baza Danych (na dysku Twojego lokalnego komputera nikt z zewnątrz nic nie zapisze).
1. Załóż darmowe konto na [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Stwórz tam klaster (Create Cluster - wybierz najtańszą darmową opcję `M0 Free`).
3. Przejdź do zakładki *Database Access* i stwórz tam swojego usera (zapisz hasło).
4. Przejdź do zakładki *Network Access* i dodaj IP `0.0.0.0/0` (aby Twój serwer z render.com mógł się połączyć).
5. Wybierz *Connect* -> *Connect your application* i skopiuj **URL Połączeniowy**. Będzie wyglądał np. tak:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/rapquiz?retryWrites=true&w=majority`
   *Podstawisz z nim swoje hasło w następnym kroku.*

## Krok 3: Umieszczenie projektu na GitHubie
Chmury takie jak Render wgrywają aplikacje czytając Twoje repozytoria z kodem (to tzw. automatyczny deployment).
1. Załóż konto na **GitHub.com**.
2. Stwórz nowe prywatne lub publiczne repozytorium o nazwie np. `rapquiz`.
3. Za pomocą oprogramowania (np. GitHub Desktop) lub środowiska skopiuj/wrzuć folder ze swoim kodem (poza folderem `node_modules`!) na to nowe branch repozytorium na Githubie.

## Krok 4: Uruchomienie Serwera w Internecie (Render.com)
1. Zarejestruj się na stronie **[Render.com](https://render.com/)** z użyciem konta GitHub utworzonego przed chwilą.
2. Kliknij **"New" -> "Web Service"**.
3. Połącz konto GitHub z Renderem i wybierz swoje wysłane repozytorium z grą `rapquiz`.
4. Wypełnij prosty formularz konfiguracji:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Zjedź w dół do sekcji wyboru planu – oczywiście **Free**.
6. **BARDZO WAŻNE:** Kliknij rozwinięcie w `Advanced` -> `Add Environment Variable`:
   - Dodaj zmienną o kluczu `MONGODB_URI`
   - Jako wartość wklej skopiowany w Kroku 2 **URL do bazy danych MongoDB**.
7. Wygeneruj serwer (kliknij u dołu "Create Web Service"). 

Render zacznie instalować moduły NPM i uruchomi `server.js` na dedykowanej globalnej maszynie, udostępniając stronę pod specjalnym adresem URL, np: `https://rapquiz-ab12.onrender.com`.

**I KONIEC!** Wszystkie skrypty Fazy 4 i 6 (Multiplayer i Turnieje) na łączach WebSockets włączą się w internecie, z logowaniem, a gracze w całej Polsce zagrają po wrzuceniu im tego adresu!
