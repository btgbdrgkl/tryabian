let mode = 'ru'; // 'ru' или 'try'

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
    if (m === 'try') renderAlphabet();
    else document.getElementById('alphabet').innerHTML = '';
}

function renderAlphabet() {
    const letters = [...new Set(dictionary.map(w => w[0][0].toLowerCase()))].sort();
    document.getElementById('alphabet').innerHTML = letters.map(l => 
        `<span class="letter" onclick="document.getElementById('search').value='${l}'; search()">${l}</span>`
    ).join('');
}

function search() {
    const query = document.getElementById('search').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    const content = document.getElementById('result-content');
    
    if (!query) { resultDiv.style.display = 'none'; return; }
    
    let matches = [];
    if (mode === 'ru') {
        matches = dictionary.filter(w => w[4].toLowerCase().includes(query));
    } else {
        matches = dictionary.filter(w => 
            w[0].toLowerCase().includes(query) || w[1].toLowerCase().includes(query)
        );
    }
    
    if (matches.length === 0) {
        content.innerHTML = '<div id="not-found">❌ Слово не найдено</div>';
        resultDiv.style.display = 'block';
        return;
    }
    
    content.innerHTML = matches.slice(0, 20).map(w => `
        <div class="word-title">${w[0]} <span style="font-size:16px;color:#ccc;">(${w[1]})</span></div>
        <div class="word-pron">${w[2]}</div>
        <div class="word-pos">${w[3]}</div>
        <div class="word-def">→ ${w[4]}</div>
        <hr style="border-color:#333;margin:15px 0;">
    `).join('');
    resultDiv.style.display = 'block';
}

// Инициализация
renderAlphabet();
