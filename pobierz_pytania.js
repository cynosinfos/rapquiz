const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');

// Konfiguracja interfejsu do wpisania linku
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Definicja schematu (musi być zgodna z serwerem)
const pendingQuestionSchema = new mongoose.Schema({
    question: String,
    category: String,
    answers: [String],
    correct: Number,
    hint: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
});

const PendingQuestion = mongoose.model('PendingQuestion', pendingQuestionSchema);

async function download(uri) {
    try {
        console.log("\n⏳ Łączenie z MongoDB...");
        // Połączenie z bazą
        await mongoose.connect(uri);
        console.log("✅ Połączono pomyślnie!");

        console.log("⏳ Pobieranie pytań z kolekcji 'pendingquestions'...");
        const questions = await PendingQuestion.find({}).sort({ timestamp: -1 }).lean();
        
        const filename = 'propozycje.json';
        fs.writeFileSync(filename, JSON.stringify(questions, null, 2), 'utf8');
        
        console.log(`\n✨ SUKCES!`);
        console.log(`-----------------------------------------`);
        console.log(`Ilość pobranych pytań: ${questions.length}`);
        console.log(`Plik został zapisany jako: ${filename}`);
        console.log(`-----------------------------------------`);
        console.log(`Teraz możesz otworzyć ten plik i przejrzeć pytania.`);
        
        process.exit(0);
    } catch (err) {
        console.error("\n❌ BŁĄD:");
        if (err.message.includes('Authentication failed')) {
            console.error("Nieprawidłowe hasło lub użytkownik w linku MONGODB_URI.");
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

console.log("=================================================");
console.log("   POBIERANIE PYTAŃ RAPQUIZ (Z BAZY RENDER)     ");
console.log("=================================================");
console.log("Skrypt połączy się bezpośrednio z Twoją bazą danych.");
console.log("");

rl.question('💻 Wklej swój MONGODB_URI (z MongoDB Atlas): ', (answer) => {
  if (!answer || answer.trim() === "") {
      console.log("❌ Błąd: Nie podano linku do bazy.");
      process.exit(1);
  }
  download(answer.trim());
});
