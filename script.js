let mode = 'try'; // Начинаем с Tryabian → Русский

function switchMode(m) {
    mode = m;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => {
        if ((m === 'ru' && t.innerText.includes('Русский')) || 
            (m === 'try' && t.innerText.includes('Trýabian'))) {
            t.classList.add('active');
        }
    });
    document.getElementById('search').value = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('sentence-result').style.display = 'none';
    if (m === 'try') renderAlphabet();
    else document.getElementById('alphabet').innerHTML = '';
}

function renderAlphabet() {
    const letters = [...new Set(dictionary.map(w => w[0][0].toLowerCase()))].sort();
    document.getElementById('alphabet').innerHTML = letters.map(l => 
        `<span class="letter" onclick="document.getElementById('search').value='${l}'; search()">${l}</span>`
    ).join('');
}

// Строим индексы
const ruIndex = {};
const tryIndex = {};

dictionary.forEach(w => {
    // Индекс русский → tryabian
    const ruWords = w[4].toLowerCase().replace(/[()]/g, '').split(/[,;\s]+/);
    ruWords.forEach(rw => {
        if (!ruIndex[rw]) ruIndex[rw] = [];
        if (!ruIndex[rw].includes(w)) ruIndex[rw].push(w);
    });
    
    // Индекс tryabian → русский (латиница и кириллица)
    if (!tryIndex[w[0].toLowerCase()]) tryIndex[w[0].toLowerCase()] = w;
    if (!tryIndex[w[1].toLowerCase()]) tryIndex[w[1].toLowerCase()] = w;
});

// Префиксы для распознавания грамматики (латиница + кириллица)
const prefixes = [
    { latin: 'hyo', cyr: 'хё', meaning: 'буд.вр.', desc: 'будущее время' },
    { latin: 'zho', cyr: 'жо', meaning: 'прош.вр.', desc: 'прошедшее время' },
    { latin: 'tyo', cyr: 'тё', meaning: 'мн.ч.', desc: 'множественное число' },
    { latin: 'ya',  cyr: 'я',  meaning: 'притяж.', desc: 'притяжательность' }
];

function findTryWord(word) {
    // Точное совпадение
    if (tryIndex[word]) return { entry: tryIndex[word], grammar: null };
    
    // Пробуем отрезать префиксы
    for (const p of prefixes) {
        if (word.startsWith(p.latin) && word.length > p.latin.length) {
            const stem = word.substring(p.latin.length);
            if (tryIndex[stem]) return { entry: tryIndex[stem], grammar: p };
        }
        if (word.startsWith(p.cyr) && word.length > p.cyr.length) {
            const stem = word.substring(p.cyr.length);
            if (tryIndex[stem]) return { entry: tryIndex[stem], grammar: p };
        }
    }
    
    return null;
}

function search() {
    const query = document.getElementById('search').value.trim();
    const resultDiv = document.getElementById('result');
    const sentenceDiv = document.getElementById('sentence-result');
    const content = document.getElementById('result-content');
    const sentenceContent = document.getElementById('sentence-content');
    
    if (!query) { 
        resultDiv.style.display = 'none'; 
        sentenceDiv.style.display = 'none';
        return; 
    }
    
    const words = query.split(/\s+/);
    
    if (words.length > 1) {
        // ПЕРЕВОД ПРЕДЛОЖЕНИЯ
        resultDiv.style.display = 'none';
        sentenceDiv.style.display = 'block';
        
        let translated = [];
        let breakdown = [];
        
        words.forEach((word) => {
            const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
            const punct = word.match(/[.,!?]/) ? word.match(/[.,!?]/)[0] : '';
            
            if (mode === 'ru') {
                // Русский → Tryabian
                const entry = ruIndex[cleanWord];
                if (entry) {
                    const w = entry[0];
                    translated.push(w[0] + punct);
                    breakdown.push(`<span style="color:#e94560;">${word}</span> → <b>${w[0]}</b> (${w[1]}) — ${w[4]}`);
                } else {
                    translated.push(`[${word}]`);
                    breakdown.push(`<span style="color:#e94560;">${word}</span> → ❌ не найдено`);
                }
            } else {
                // Tryabian → Русский
                const result = findTryWord(cleanWord);
                if (result) {
                    const w = result.entry;
                    const g = result.grammar;
                    const grammarNote = g ? ` <span style="color:#e94560;">[${g.meaning}]</span>` : '';
                    const displayWord = g ? w[4].split(',')[0] + ' ' + g.desc : w[4].split(',')[0];
                    translated.push(displayWord + punct);
                    breakdown.push(`<span style="color:#e94560;">${word}</span> → <b>${w[4]}</b>${grammarNote} (основа: ${w[0]})`);
                } else {
                    translated.push(`[${word}]`);
                    breakdown.push(`<span style="color:#e94560;">${word}</span> → ❌ не найдено`);
                }
            }
        });
        
        sentenceContent.innerHTML = `
            <div style="background:#0f3460;padding:20px;border-radius:12px;margin-bottom:15px;">
                <div style="font-size:13px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Перевод</div>
                <div style="font-size:24px;color:#fff;line-height:1.5;">${translated.join(' ')}</div>
            </div>
            <div style="background:#16213e;padding:20px;border-radius:12px;">
                <div style="font-size:13px;color:#888;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Разбор</div>
                ${breakdown.map(b => `<div style="font-size:15px;color:#ccc;margin:8px 0;padding:6px 0;border-bottom:1px solid #222;">${b}</div>`).join('')}
            </div>
        `;
        
    } else {
        // ПОИСК ОДНОГО СЛОВА
        sentenceDiv.style.display = 'none';
        
        let matches = [];
        if (mode === 'ru') {
            const q = query.toLowerCase();
            Object.keys(ruIndex).forEach(key => {
                if (key.includes(q)) {
                    ruIndex[key].forEach(w => {
                        if (!matches.includes(w)) matches.push(w);
                    });
                }
            });
        } else {
            const q = query.toLowerCase();
            Object.keys(tryIndex).forEach(key => {
                if (key.includes(q)) {
                    const w = tryIndex[key];
                    if (!matches.includes(w)) matches.push(w);
                }
            });
        }
        
        if (matches.length === 0) {
            content.innerHTML = '<div id="not-found">❌ Слово не найдено</div>';
            resultDiv.style.display = 'block';
            return;
        }
        
        content.innerHTML = matches.slice(0, 20).map(w => `
            <div class="word-title">${w[0]} <span style="font-size:16px;color:#aaa;">(${w[1]})</span></div>
            <div class="word-pron">${w[2]}</div>
            <div class="word-pos">${w[3]}</div>
            <div class="word-def">→ ${w[4]}</div>
            <hr style="border-color:#222;margin:15px 0;">
        `).join('');
        resultDiv.style.display = 'block';
    }
}

// Инициализация
renderAlphabet();
switchMode('try');
