const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('js/data/questions.js', 'utf8');
content = content.replace(/^const RAPQUIZ_QUESTIONS\s*=\s*/, '').replace(/;\s*$/, '');
const data = JSON.parse(content);

let nextId = 3201;
const id = () => nextId++;

// ── NOWE 2010-2020 (33 pytania) ───────────────────────────────────
const new2010 = [
  // PYSKATY (PY-01..07)
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Jak naprawdę nazywa się Pyskaty?", answers:["Piotr Chojnacki","Przemysław Chojnacki","Paweł Chodkowski","Piotr Chrostowski"], correct:1, tags:["pyskaty"], hint:"Imię zaczyna się na P jak pseudonim." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Który z albumów solowych Pyskaty wydał jako pierwszy (2009)?", answers:["Pasja","Skazani na Sukcezz","Pysk w pysk","Reedycja"], correct:2, tags:["pyskaty"], hint:"Debiut solowy. Rok 2009." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"W jakim projekcie grupowym działał Pyskaty zanim zaczął karierę solo?", answers:["HiFi Banda","Grammatik","Ganja Mafia","Skazani na Sukcezz"], correct:3, tags:["pyskaty"], hint:"Razem na sukces — tytuł mówi wszystko." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Z kim Pyskaty nagrał gościnnie remix singla 'Puszer'?", answers:["Pezetem","Białasem","HiFi Bandą","Tede"], correct:2, tags:["pyskaty","hifibanda"], hint:"Banda grała na HiFi." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Który raper jest producentem muzycznym i twórcą HiFi Bandy?", answers:["Diox","Hades","DJ Kebs","Czarny HiFi"], correct:3, tags:["hifibanda"], hint:"Jego pseudonim to kolor + nazwa zespołu." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Jaki był skład HiFi Bandy podczas nagrania albumu '23:55'?", answers:["Pyskaty, Diox, Borixon, DJ Kebs","Diox, Hades, Czarny HiFi, DJ Kebs","Hades, Fokus, Czarny HiFi, DJ Wika","Diox, Taco, Czarny HiFi, DJ Kebs"], correct:1, tags:["hifibanda"], hint:"Czterech panów, jeden hiFi sound." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"W którym roku ukazał się album HiFi Bandy '23:55'?", answers:["2008","2009","2010","2012"], correct:2, tags:["hifibanda"], hint:"Pięć minut do północy — nowy rok dekady." },

  // BONSON (BO-01..05)
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Z jakiego miasta pochodzi raper Bonson?", answers:["Poznań","Gdańsk","Kraków","Szczecin"], correct:3, tags:["bonson"], hint:"Miasto na Pomorzu Zachodnim, przy granicy." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Z którą wytwórnią był związany Bonson przez większość kariery?", answers:["Asfalt Records","SBM Label","Stoprocent","QueQuality"], correct:2, tags:["bonson","stoprocent"], hint:"100% rapowego poświęcenia." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Jak nazywa się producent, z którym Bonson stworzył duety (albumy 'Historia po pewnej historii' i 'MVP')?", answers:["Soulpete","Matheo","Matek","Eljot Sounds"], correct:2, tags:["bonson","matek"], hint:"Imię jak skrót od Mateusz." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Album Bonson & Matek 'Historia po pewnej historii' ukazał się oryginalnie jako:", answers:["Oficjalny album Stoprocent","Mixtape na zamówienie","Nielegal (darmowy projekt)","Album ekskluzywny dla fanów"], correct:2, tags:["bonson","matek"], hint:"Bezpłatna dystrybucja — podziemna tradycja." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"BonSoul to projekt Bonsona z którym producentem?", answers:["Matkiem","Czarnym HiFi","Soulpete'em","Jimkiem"], correct:2, tags:["bonson","bonsoul"], hint:"Soul + Bon = BonSoul, producent holenderski o duszy." },

  // DWA SŁAWY (DS-01..05)
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Z jakiego miasta pochodzi duet Dwa Sławy?", answers:["Warszawa","Kraków","Łódź","Wrocław"], correct:2, tags:["dwaslawy"], hint:"Miasto filmowe, miasto włókiennicze." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Jakie są pseudonimy artystów tworzących Dwa Sławy?", answers:["Dino i Racek","Astek i Rado Radosny","Yaro i Radek","Jaro i Słapa"], correct:1, tags:["dwaslawy"], hint:"Jeden buduje, drugi się raduje." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"W którym roku został założony duet Dwa Sławy?", answers:["2003","2006","2009","2011"], correct:1, tags:["dwaslawy"], hint:"Rok mistrzostw świata w Niemczech." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Który album Dwa Sławy jako pierwszy zdobył status złotej płyty?", answers:["Nie wiem, nie orientuję się","Dandys Flow","Ludzie sztosy","Coś przerywa"], correct:2, tags:["dwaslawy"], hint:"Sztosy dla sztosowich." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Jak nosił tytuł debiutancki nielegal Dwa Sławy z 2007 roku?", answers:["Muzyka kozacka","Nieśmiertelna nawijka Dwusławowa","Dla sławy","Pokolenie X2"], correct:2, tags:["dwaslawy"], hint:"Cel w nazwie." },

  // PLANET ANM (PL-01..05)
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Planet ANM to pseudonim rapera, który naprawdę nazywa się:", answers:["Artur Płaneta","Paweł Niemira","Radosław Płaneta","Rafał Niemczyk"], correct:2, tags:["planetanm"], hint:"ANM to skrót od grupy Anomalia." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Debiutancki solowy album Planet ANM 'Pas Oriona' wydał wspólnie z producentem:", answers:["Matkiem","Soulpete'em","Czarnym HiFi","Eljot Sounds"], correct:3, tags:["planetanm"], hint:"Nazwisko producenta brzmi jak 'Elliota Sound'." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Planet ANM był wcześniej członkiem grupy, która wydała 'Widzę więcej' i 'Skoki napięcia':", answers:["Skazani na Sukcezz","Anomalia ANM","HiFi Banda","Grammatik"], correct:1, tags:["planetanm","anomalia"], hint:"Skrót ANM pochodzi od tej nazwy." },
  { id:id(), category:"2010-2020", difficulty:"trudny", question:"Jaki debiutancki solowy nielegal wydał Planet ANM w 2010 roku?", answers:["Sygnał","Pas Oriona","Flashback","Konstelacja"], correct:3, tags:["planetanm"], hint:"Układ gwiazd." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Jaki album solowy Planet ANM ukazał się w 2017 roku?", answers:["Universum","Konstelacja","Sygnał","Flashback"], correct:3, tags:["planetanm"], hint:"Błysk wspomnień z przeszłości." },

  // MIX (MX-01..03)
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Kto nagrał wspólny album 'Milion dróg do śmierci' (2013)?", answers:["Bonson i Matek","Pyskaty i Hades","Kali i Paluch","Dwa Sławy i Tede"], correct:2, tags:["kali","paluch","ganjamaf"], hint:"Dwie legendy Ganja Mafii." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Album Bonsona 'Znany i lubiany' ukazał się w roku:", answers:["2014","2015","2016","2018"], correct:2, tags:["bonson"], hint:"Rok przed 'Postanawia umrzeć'." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Bonson opuścił wytwórnię Stoprocent w którym roku?", answers:["2015","2016","2017","2018"], correct:3, tags:["bonson","stoprocent"], hint:"Ten sam rok co jego album 'Postanawia umrzeć'." },

  // N1 batch
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Jak naprawdę nazywa się raper Paluch?", answers:["Łukasz Palkowski","Łukasz Paluszak","Marek Paluch","Łukasz Paliniewski"], correct:1, tags:["paluch"], hint:"Paluszak — zdrobnienie od paluch." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Z jakiego osiedla i miasta pochodzi Paluch?", answers:["Praga, Warszawa","Nowa Huta, Kraków","Piątkowo, Poznań","Grunwald, Poznań"], correct:2, tags:["paluch"], hint:"Piąte osiedle i wielkopolska stolica." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"W którym roku PRO8L3M wydał swój debiutancki album studyjny (pt. PRO8L3M)?", answers:["2013","2014","2015","2016"], correct:3, tags:["pro8l3m"], hint:"Rok Euro 2016." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Jak nazywa się album PRO8L3M z 2019 roku?", answers:["Ground Zero Mixtape","Art Brut 2","Hack3d By GH05T","Widmo"], correct:3, tags:["pro8l3m"], hint:"Duch — zjawa z ducha rapu." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Jak naprawdę nazywa się Szpaku?", answers:["Maciej Szpakowski","Michał Szpak","Mateusz Jakub Szpakowski","Mariusz Szpak"], correct:2, tags:["szpaku"], hint:"Inicjały to MJS." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"Jaki był debiutancki album studyjny Szpaku?", answers:["Dzieci Duchy","Młody Simba","BORuto","Atypowy"], correct:3, tags:["szpaku"], hint:"Niestandardowy, inny niż wszyscy — tytuł mówi o nim samym." },
  { id:id(), category:"2010-2020", difficulty:"łatwy", question:"GrubSon pochodzi z jakiego miasta?", answers:["Szczecina","Gdańska","Krakowa","Rybnika"], correct:3, tags:["grubson"], hint:"Śląskie miasto — w regionie węgla i kabaretów." },
  { id:id(), category:"2010-2020", difficulty:"średni", question:"Ten Typ Mes wydał album 'Trzeba było zostać dresiarzem' w roku:", answers:["2013","2014","2015","2016"], correct:1, tags:["tentypmes"], hint:"Rok przed 'Ała' — dwa lata po pierwszym solowym." },
];

// ── NOWE 2020-NOW (23 pytania) ────────────────────────────────────
const new2020 = [
  // QB batch (QB-01,04,07,08,09,10,11,13,14,16,17,19,21,22,24,25)
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Album i film 'Północ / Południe' to który studyjny album Quebonafide?", answers:["Trzeci","Czwarty","Piąty","Szósty"], correct:2, tags:["quebonafide","polnocpoludnie"], hint:"Quinta essentia Quebo." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Film 'Północ / Południe' Quebonafide opowiada o jego zmaganiach z jaką chorobą?", answers:["Depresja jednobiegunowa","Schizofrenia","Choroba afektywna dwubiegunowa (ChAD)","Zaburzenia lękowe"], correct:2, tags:["quebonafide","polnocpoludnie"], hint:"Bieguny — Północ i Południe — jak choroba." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Nakładem jakiej wytwórni ukazał się album 'Północ / Południe' Quebonafide?", answers:["QueQuality","SBM Label","Asfalt Records","Magnetowid"], correct:3, tags:["quebonafide"], hint:"Analogowa technologia z lat 80." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Który znany sportowiec wystąpił gościnnie w filmie 'Północ / Południe'?", answers:["Iga Świątek","Adam Małysz","Robert Lewandowski","Kamil Stoch"], correct:2, tags:["quebonafide","polnocpoludnie"], hint:"Najlepszy strzelec w historii Barcelony." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Vkie to raper, który naprawdę nazywa się:", answers:["Kamil Lis","Łukasz Liszka","Marek Wiśniewski","Łukasz Kowalski"], correct:1, tags:["vkie"], hint:"Liszka — leśne zwierzę i prawdziwe nazwisko." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Vkie wydał album 'Dżungla' w którym roku?", answers:["2019","2020","2021","2022"], correct:2, tags:["vkie"], hint:"Rok po pandemii — czas dzikich wydawnictw." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Jakie były albumy Vkie w kolejności po 'Dżungla'?", answers:["Barbara to #VKIEszn","Brak kontroli to Dżungla 2","#VKIEszn (2023) to Barbara (2024)","Primo to Junkie to Dżungla"], correct:2, tags:["vkie"], hint:"Sezon (szn) poprzedza kobietę." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Okekel był pierwszym polskim raperem wyróżnionym w prestiżowym programie Apple Music:", answers:["Artists to Watch","New Artist Spotlight","Up Next","Future Beats"], correct:2, tags:["okekel"], hint:"Następny w kolejce do sławy." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Z jakim labelem współpracuje Okekel?", answers:["QueQuality","SBM Label","Stoprocent","Def Jam Recordings Poland"], correct:3, tags:["okekel","defjam"], hint:"Globalny gigant wydawniczy z polskim oddziałem." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Z jakiej warszawskiej dzielnicy pochodzi Janusz Walczuk?", answers:["Praga","Ursynów","Mokotów","Żoliborz"], correct:3, tags:["januszwalczuk"], hint:"Elegancka północna dzielnica stolicy." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Pod jakim pseudonimem Janusz Walczuk działał przed karierą solową?", answers:["JW01","Janek R","Yah00","JWalczuk"], correct:2, tags:["januszwalczuk"], hint:"Popularna wyszukiwarka internetowa w pisowni z zerami." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Jak Janusz Walczuk zdobywał doświadczenie przed debiutem solowym?", answers:["Jako DJ w klubach","Jako grafik dla SBM","Jako manager Maty","Jako realizator dźwięku w Nobocoto Studio"], correct:3, tags:["januszwalczuk"], hint:"Pracował nad albumami Maty i Żabsona za kulisami." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Skąd pochodzi Vae Vistic?", answers:["Warszawa","Wrocław","Kraków","Gdańsk"], correct:2, tags:["vaevistic"], hint:"Miasto Smoka Wawelskiego." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Do jakiej łacińskiej sentencji nawiązuje pseudonim Vae Vistic?", answers:["Vae gloria (biada chwale)","Vae soli (biada samotnym)","Vae victis (biada zwyciężonym)","Vae igni (biada ogniowi)"], correct:2, tags:["vaevistic"], hint:"Brennus rzucił miecz na szalę." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Na albumie Vae Visticka 'Omirya' (2023) gościnnie wystąpili m.in.:", answers:["Mata, Taco, Quebonafide","Young Igi, Kizo, Otsochodzi","Szpaku, Gibbs, Pezet, CatchUp, Frank Leen","Bedoes, White 2115, Bonson"], correct:2, tags:["vaevistic"], hint:"Przekrojowe polskie rap gwiazdy z różnych środowisk." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Z jakim labelem związany jest Vae Vistic?", answers:["SBM Label","QueQuality","GUGU","Fonografika"], correct:2, tags:["vaevistic","gugu"], hint:"Krótka nazwa — 4 litery, zdwojone 'gu'." },

  // N2 batch
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Jak nazywał się pierwszy wspólny album kolektywu 2115 (2022)?", answers:["Hotel Maffija","Rodzinny biznes","Biznez jak vibe","2115 Vol. 1"], correct:1, tags:["2115"], hint:"Rodzina to wszystko — i tytuł albumu." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Który z artystów NIE jest członkiem kolektywu 2115?", answers:["White 2115","Kuqe 2115","Żabson","Flexxy 2115"], correct:2, tags:["2115","zabson"], hint:"Ten artysta działa w ramach Internaziomal." },
  { id:id(), category:"2020-now", difficulty:"trudny", question:"Otsochodzi naprawdę nazywa się:", answers:["Miłosz Czajkowski","Mikołaj Stępniak","Miłosz Stępień","Michał Andrzejewski"], correct:2, tags:["otsochodzi"], hint:"Imię z 'miłości', nazwisko od kroku." },
  { id:id(), category:"2020-now", difficulty:"średni", question:"Young Igi wspólnie z Żabsonem wydali album o tytule:", answers:["OIO","Notatki z marginesu","Ekskluzywny Głód","Amfisbena"], correct:3, tags:["youngigi","zabson"], hint:"Mityczny dwugłowy wąż." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Jaki album White 2115 nagrał wspólnie z Białasem w 2021 roku?", answers:["Rockstar: Do zachodu słońca","Pretty Boy","Diamentowy las","ROCKST4R"], correct:2, tags:["white2115","bialas"], hint:"Las z diamentów — dwie legendy." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Bedoes wydał album 'Rewolucja romantyczna' w roku:", answers:["2020","2021","2022","2023"], correct:1, tags:["bedoes"], hint:"Rewolucja rokująca — rok po pandemii." },
  { id:id(), category:"2020-now", difficulty:"łatwy", question:"Kizo wydał album 'Posejdon' w którym roku?", answers:["2019","2020","2021","2022"], correct:1, tags:["kizo"], hint:"Bóg mórz i rok pandemii w jednym." },
];

// Dodaj do bazy
data['2010-2020'] = [...data['2010-2020'], ...new2010];
data['2020-now']  = [...data['2020-now'],  ...new2020];

// Policz
let total = 0;
console.log('=== WYNIK ===');
for (const [cat, arr] of Object.entries(data)) {
  console.log(`  ${cat}: ${arr.length} pytań`);
  total += arr.length;
}
console.log(`  ŁĄCZNIE: ${total} pytań`);

// Zapisz
const out = 'const RAPQUIZ_QUESTIONS = ' + JSON.stringify(data, null, 2) + ';';
fs.writeFileSync('js/data/questions.js', out, 'utf8');
console.log('Zapisano questions.js ✅');
