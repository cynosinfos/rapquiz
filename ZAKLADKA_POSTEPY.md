# 📌 ZAKLADKA – POSTEPY WERYFIKACJI RAPQUIZ
Ostatnia aktualizacja: 2026-03-30, ~00:16

---

## ✅ Co zostało zrobione (sesja 2026-03-30)

### Usunięte pytania (błędne / nieweryfikowalne):
- ID 2136–2140: poprawiono 2136 i 2137, usunięto 2138 i 2139
- ID 2143–2155: usunięto 7 pytań (2143–2148, 2150)
- ID 2152, 2153: usunięto
- Paczka 2154–3003: usunięto **35 pytań** (zostały tylko potwierdzone ✅)
- Paczka 3042–3103: usunięto **31 pytań**
- Paczka 3104–3200: usunięto **24 pytania**
- Paczka 3004–3041: usunięto **19 pytań**

### ŁĄCZNIE USUNIĘTO DZIŚ: ~120+ pytań błędnych/niezweryfikowanych

---

## 📊 Obecny stan bazy

| Parametr | Wartość |
|---|---|
| Łączna liczba pytań | **342** |
| Pierwsze ID | 1001 |
| Ostatnie ID | 3200 |
| Status | ✅ Tylko zweryfikowane pytania |

---

## 📍 Gdzie skończyliśmy

**Zweryfikowano i wyczyszczono wszystkie pytania do ID 3200 (koniec bazy).**
Baza pytań jest kompletnie przejrzana i gotowa.

---

## 🎯 Następne kroki (na kolejną sesję)

1. **Sprawdzić grę na żywo** – odpalić RAPQUIZ i przetestować czy pytania działają poprawnie
2. **Ewentualne dodanie nowych pytań** – jeśli baza 342 pytań to za mało
3. **Deploy** – przygotowanie gry do publikacji w sieci
4. **MongoDB** – podpięcie bazy danych do backendu (wg INSTRUKCJA_MONGODB_I_TESTY.md)

---

## ⚠️ Ważne uwagi techniczne

- Plik główny: `js/data/questions.js`
- Po otwarciu pliku w edytorze po skryptach – **wybieraj "Nie zapisuj"** dla starej wersji
- Struktura JSON musi być poprawna – używaj skryptów Node.js do usuwania
- Skrypt czyszczący: `clean_batch.js` (nadal dostępny)
