# EDYCJA I ROZBUDOWA BAZY PYTAŃ RAPQUIZ

Wszystkie pytania i logiczne założenia ujęte są w jednym, gigantycznym pilku tekstowym w formacie JSON / JavaScript Object, z którego interfejs czerpie zasoby sekunda po sekundzie.

## Lokalizacja Pliku
Twój kluczowy plik z bazą to:
`c:\Users\Dziubasek\.gemini\antigravity\scratch\RAPQUIZ\js\data\questions.js`

Otwórz go za pomocą obojętnie jakiego edytora kodu (Visual Studio Code, a nawet zintegrowany notatnik), a ujrzysz wielkie drzewo zaczynające się od:
`const RAPQUIZ_QUESTIONS = { ... }`

## Format i Pola Struktury

Pojedyncze pytanie do silnika prezentuje się dokładnie tak:
```javascript
{ 
  "id": 3028, 
  "category": "2010-now", 
  "difficulty": "trudny", 
  "question": "Kaz Bałagane wydał kultowy album 'Narkopop' w którym roku?", 
  "answers": ["2015", "2017", "2019", "2013"], 
  "correct": 1, 
  "tags": ["kazbalagane", "narkopop"], 
  "hint": "2017." 
}
```

**Co oznaczają te liczby?**
- `"id"` – Musi być unikatowe wewnątrz struktury (np. lata 90 to numery `1xxx`, lata zerowe to `2xxx`, a obecne to `3xxx`). Nigdy nie przypisuj dwóch identycznych `id` dwóm pytaniom.
- `"category"` – Zawsze używaj dosłownie jednego z trzech stringów: `"1990-2000"`, `"2000-2010"`, lub `"2010-now"`. (Każde z nich jest osobną listą w kodzie startowym).
- `"difficulty"` – String określający trudność (`"łatwy"`, `"średni"`, `"trudny"`). Obecny silnik potrafi miksować ten poziom losując pytania.
- `"question"` – Treść Twojego pytania w cudzysłowach.
- **`"answers"`** – Koniecznie kwadratowe nawiasy z 4 (i tylko 4!) odpowiedziami ujętymi w znaki cudzysłowów `"..."`. 
- **`"correct"`** – CYFRA od **`0` do `3`**! Informatyka liczy od zera. Jeżeli więc poprawna jest pierwsza odpowiedź ("2015"), wpisujesz `0`. Byłaby druga ("2017"), więc klucz poprawności wynosi `1`. Dla ostatniej odpowiedzi wieszasz flagę `3`.
- `"tags"` – Dowolne tagi ułatwiające przeszukiwanie z poziomu ewentualnego interfejsu administracyjnego.
- `"hint"` – Podpowiedź pojawiająca się gdy gracz skorzysta z koła *Telefon do przyjaciela* (może być lekko myląca na poziomie trudnym).

## Zasady Dokładania Nowych Elementów
Aby dodać kolejne pytania postępuj zgodnie z modelem list. Każden nowo definiowany kloc na zakończenie ma posiadać przecinek ( `,` ) – za wyjątkiem ostatniego pytania w kategorii!

**Przykład prawidłowy:**
```javascript
  { "id": 1030, "category": "1990-2000", /* ... */ },
  { "id": 1031, "category": "1990-2000", /* ... to jest nowo dodane pytanie */ }
```

**Błędy krytyczne sprawiające, że ekran nagle zrobi się biały, a gra wybuchnie:**
1. **Brakujący cudzysłów**. Jeśli masz w nazwie cudzysłów (np. `Kawałek "To my" Płomienia`), musisz go "uciec" używając ukośnika przed znakiem specjalnym (tzw. escape `\"`):
   ➡ `"question": "Kto nagrał utwór \"To my Polacy\"?"`
2. Zapomnienie przecinka oddzielającego pytania.
3. Objęcie prawidłowych nawiasów klamrowych `{}` nie tymi literami.

## Sugestia Zarządzania Pytaniami ze Sztuczną Inteligencją (LLM / ChatGPT):
Najlepiej jest rozbudowywać bazę wklejając krótki monit do modelu językowego:

> "Wygeneruj mi w formacie tablicy JSON dodatkowe 30 pytań rapowych z lat 2000-2010 dla mojego quizu. Zawsze 4 odpowiedzi, 'correct' od 0 do 3, zachowaj ułożenie pól: id, category ('2000-2010'), difficulty, question, answers, correct, tags, hint. Zacznij id od 2031 w górę."

Skopiuj odpowiedź, sklej ją pod ostatnim pytaniem w pliku `questions.js`, dodając wymagany przecinek i gra z miejsca uzyska te pytania podczas kolejnego użycia kołowrotka przeglądarki. Nie potrzeba do nich restartować serwera.
