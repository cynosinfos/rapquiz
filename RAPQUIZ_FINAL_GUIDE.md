# RAPQUIZ: Finalna Instrukcja Operacyjna 🚀

Gratulacje! Gra jest technicznie gotowa do lotu. Ten dokument zawiera wszystko, co musisz wiedzieć, aby zarządzać projektem, aktualizować go i utrzymywać na serwerze.

## 1. Wdrożenie na Produkcję (Deployment)

Obecnie gra jest przygotowana do działania na platformie **Render.com**.

### Backend (Serwer):
- **Adres serwera**: Jeśli zmienisz serwer, zaktualizuj zmienną `API_URL` w plikach `js/menu.js` oraz `js/multiplayer.js`.
- **Baza danych**: Pamiętaj o ustawieniu zmiennej środowiskowej `MONGODB_URI` w panelu Render (to już zrobiliśmy, ale warto o tym pamiętać przy zmianie serwera).

### Domena `rapq.pl`:
- Skieruj rekordy A swojej domeny na adres IP serwera Render (znajdziesz go w panelu Settings -> Custom Domains).

## 2. Zarządzanie Bazą Pytań ✍️

Pytania znajdują się w pliku `js/questions.js`. Są podzielone na trzy epoki:
1. `1990-2010`
2. `2010-2020`
3. `2020-now`

**Jak dodać pytanie?**
Wklej nowy obiekt do odpowiedniej tablicy:
```javascript
{
  id: 4001,
  question: "Kto wydał album 'Wojtek Sokół' w 2019 roku?",
  answers: ["Sokół", "Pono", "Włodi", "Pezet"],
  correct: 0,
  category: "2010-2020"
}
```
> [!IMPORTANT]
> Zawsze pamiętaj o przecinku na końcu obiektu i upewnij się, że `correct` to numer poprawnej odpowiedzi (liczymy od 0).

## 3. Zmiana Reklamy (Sidebar) 📢

Reklama znajduje się w lewym sidebarze (`aside#sidebarLeft`). 
- Aby zmienić tekst lub link, wejdź w `index.html` (linie 44-50).
- Jeśli chcesz dodać tam grafikę, zastąp tekst tagiem `<img>`:
  ```html
  <img src="twoja_reklama.png" style="width:100%; cursor:pointer;">
  ```

## 4. Udostępnianie w Social Media 🔗

Dodałem wsparcie dla **Open Graph (OG Tags)**. Aby zdjęcie i opis wyświetlały się poprawnie na Facebooku:
- Facebook musi zaindeksować Twoją domenę `rapq.pl`. 
- Możesz ręcznie wymusić odświeżenie podglądu, używając: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- **Pamiętaj**: Udostępnianie nie zadziała poprawnie przy testowaniu na `localhost` – Facebook musi mieć dostęp do publicznego adresu Twojej strony.

## 5. Optymalizacja Mobilna (iPhone/Android) 📱

Wdrożyłem następujące rozwiązania:
- **100dvh**: Gra idealnie wypełnia ekran iPhone'a, nie chowając się pod paskiem Safari.
- **Auto-Zoom Fix**: Pola tekstowe mają wymuszone 16px, co blokuje irytujące przybliżanie ekranu na iOS.
- **Prędkość**: Dodaliśmy akcelerację sprzętową dla animacji logo, co zapewnia płynność na starszych Androidach.

---
**Projekt przygotowany przez:** *Antigravity AI (Pair Programming)*
W razie pytań, Twoja baza kodu jest czysta, zmodularyzowana i gotowa na dalszy rozwój (np. system poziomów czy rankingi sezonowe). 

**Elo! 🎤**
