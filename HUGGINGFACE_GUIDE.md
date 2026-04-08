# 🎭 Instrukcja: Hosting na Hugging Face Spaces (BEZ KARTY)

Hugging Face Spaces to obecnie najlepsza opcja na darmowy hosting (Docker) bez konieczności podawania numeru karty kredytowej.

## 1. Przygotowanie Konta
1. Załóż konto na [huggingface.co](https://huggingface.co/).
2. Nie musisz podczepiać karty płatniczej.

## 2. Tworzenie nowej Przestrzeni (Space)
1. Kliknij **"New"** (w prawym górnym rogu) -> **"Space"**.
2. Nadaj nazwę (np. `rapquiz`).
3. **Ważne:** Wybierz SDK: **Docker**.
4. Wybierz szablon: **Blank**.
5. Space Hardware: Zostaw darmowe **"CPU Basic"**.
6. Visibility: **Public** (jeśli chcesz, aby inni mogli grać).
7. Kliknij **"Create Space"**.

## 3. Deployment (Przesłanie plików)
Najlepiej połączyć "Space" z Twoim GitHubem (tak jak na Renderze/Koyeb):
1. W ustawieniach Space'a znajdziesz sekcję **"Connected GitHub repository"**.
2. Połącz repozytorium `rapquiz`.
3. Przy każdym `git push` na GitHub, Hugging Face automatycznie zbuduje kontener na podstawie dołączonego pliku `Dockerfile`.

## 4. Zmienne Środowiskowe (Secrets)
1. Wejdź w zakładkę **Settings** swojego Space'a.
2. Zjedź do sekcji **"Variables and secrets"**.
3. Kliknij **"New secret"** i dodaj:
   - `MONGODB_URI` — Twój link do MongoDB Atlas.
   - `JWT_SECRET` — Twoje tajne hasło do klucza (np. `MojeTajneHaslo123`).
4. (Opcjonalnie) Dodaj zmienną `PORT` o wartości `7860`, choć Dockerfile już to ustawia.

## 5. Podpięcie domeny rapq.pl
Hugging Face pozwala na customowe domeny tylko w płatniejszych planach, **ALE** możesz to obejść na home.pl:
1. W panelu home.pl ustaw przekierowanie typu **"Ramka / Maskowanie"** (iFrame) na adres Twojego Space'a (np. `https://cynosinfos-rapquiz.hf.space`).
2. Dzięki temu użytkownik wpisując `rapq.pl` zobaczy grę, a w pasku adresu nadal będzie widniało Twoje logo.

---

## 🛠️ Nowa funkcja: Podgląd Pytań od Graczy
Dodałem "ukryty" adres do przeglądania propozycji pytań przed ich dodaniem do gry.
- **Link:** `https://TWOJA-APKA.hf.space/api/questions/pending`
- Wyświetli Ci on wszystkie przesłane pytania w formacie JSON — możesz je skopiować i dokleić do pliku `questions.js`.

---

**Gotowe! Wszystkie zmiany (Dockerfile, nowa trasa w serwerze) pchnij teraz na gita, a Hugging Face zajmie się resztą.** 🚀
