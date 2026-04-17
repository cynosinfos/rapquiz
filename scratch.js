// Dodaj to na końcu pliku js/game.js
window.leaveGameEarly = function() {
    if (confirm("Czy na pewno chcesz opuścić aktualnie trwającą grę? Twój obecny wynik nie zostanie zapisany, a jeśli grasz ze znajomymi - zostaniesz oznaczony jako 'Wyszedł'.")) {
        if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
        
        if (window.isMultiplayer) {
            if (window.multiplayerLeaveLobby) window.multiplayerLeaveLobby();
        } else {
            showMenu();
        }
    }
}
