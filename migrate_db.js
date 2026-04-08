const fs = require('fs');

let content = fs.readFileSync('js/data/questions.js', 'utf-8');
content = content.replace('const RAPQUIZ_QUESTIONS =', 'global.RQ =');
eval(content);

const old1 = RQ['1990-2000'] || [];
const old2 = RQ['2000-2010'] || [];
const old3 = RQ['2010-now'] || [];

const newQs = {
    '1990-2010': [],
    '2010-2020': [],
    '2020-now': []
};

// Merge 1 and 2
for(let q of old1) {
    q.category = '1990-2010';
    newQs['1990-2010'].push(q);
}
for(let q of old2) {
    q.category = '1990-2010';
    newQs['1990-2010'].push(q);
}

// Split 3
const kw2020 = ['2020','2021','2022','2023','2024','2025','mata','bambi','leosia','fukaj','kinny','oio','hotel maffija','club2020','2115','chivas','kizo','szczyl','sbm starter','zdechły','oskar83','11:11'];

for(let q of old3) {
    let text = JSON.stringify(q).toLowerCase();
    let is2020 = kw2020.some(kw => text.includes(kw));
    
    // Custom exclusions / exceptions can be placed here
    
    if (is2020) {
        q.category = '2020-now';
        newQs['2020-now'].push(q);
    } else {
        q.category = '2010-2020';
        newQs['2010-2020'].push(q);
    }
}

// Re-write
const newOutput = `const RAPQUIZ_QUESTIONS = ${JSON.stringify(newQs, null, 2)};\n`;
fs.writeFileSync('js/data/questions.js', newOutput, 'utf-8');
console.log('Migrated successfully. Counts:');
console.log('1990-2010:', newQs['1990-2010'].length);
console.log('2010-2020:', newQs['2010-2020'].length);
console.log('2020-now:', newQs['2020-now'].length);
