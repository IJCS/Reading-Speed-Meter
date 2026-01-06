let state = {
    currentLanguage: 'en',
    texts: { en: [], es: [] },
    isReading: false,
    startTime: null,
    timerInterval: null,
    currentText: '',
    results: []
};

// Translations
const translations = {
    en: {
        wpmLabel: 'WPM',
        pressStart: 'Press Start to begin reading',
        startBtn: 'Start',
        stopBtn: 'Stop',
        statWords: 'Words:',
        statSeconds: 'Seconds:',
        statEstimated: 'Estimated:',
		resultLabel: 'Results'
    },
    es: {
        wpmLabel: 'PPM',
        pressStart: 'Presiona Iniciar para empezar a leer',
        startBtn: 'Iniciar',
        stopBtn: 'Detener',
        statWords: 'Palabras:',
        statSeconds: 'Segundos:',
        statEstimated: 'Estimado:',
		resultLabel: 'Resultados'
    },
    ru: {
        wpmLabel: 'СВМ',
        pressStart: 'Нажмите Старт, чтобы начать чтение',
        startBtn: 'Старт',
        stopBtn: 'Стоп',
        statWords: 'Слова:',
        statSeconds: 'Секунды:',
        statEstimated: 'Оценка:',
		resultLabel: 'Результаты'
    },
    de: {
        wpmLabel: 'WPM',
        pressStart: 'Drücken Sie Start, um mit dem Lesen zu beginnen',
        startBtn: 'Start',
        stopBtn: 'Stopp',
        statWords: 'Wörter:',
        statSeconds: 'Sekunden:',
        statEstimated: 'Geschätzt:',
		resultLabel: 'Ergebnisse'
    },
    fr: {
        wpmLabel: 'MPM',
        pressStart: 'Appuyez sur Démarrer pour commencer la lecture',
        startBtn: 'Démarrer',
        stopBtn: 'Arrêter',
        statWords: 'Mots:',
        statSeconds: 'Secondes:',
        statEstimated: 'Estimé:',
		resultLabel: 'Résultats'
    }
};

const elements = {
	//langs elements
    langEn: document.getElementById('lang-en'),
    langEs: document.getElementById('lang-es'),
    langRu: document.getElementById('lang-ru'),
    langDe: document.getElementById('lang-de'),
    langFr: document.getElementById('lang-fr'),
	
    avgWpm: document.getElementById('avg-wpm'),
    paragraphText: document.getElementById('paragraph-text'),
    startBtn: document.getElementById('start-btn'),
    wordCount: document.getElementById('word-count'),
    seconds: document.getElementById('seconds'),
    estimated: document.getElementById('estimated'),
    resultsContainer: document.getElementById('results-container'),
    resultsList: document.getElementById('results-list'),
	
	//Labels
	wpmLabel: document.getElementById('wpm-label'),
    startBtnText: document.getElementById('start-btn-text'),
    statWords: document.getElementById('stat-words'),
    statSeconds: document.getElementById('stat-seconds'),
    statEstimated: document.getElementById('stat-estimated'),
	resultlabel: document.getElementById('results-text')
};

async function loadTexts() {
    try {
        const response = await fetch('./texts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        state.texts = data;
        console.log('Texts loaded:', data);
        loadRandomText();
    } catch (error) {
        console.error('Error loading texts:', error);
        elements.paragraphText.textContent = 'Error loading texts.json.';
    }
}

function updateUILanguage() {
    const t = translations[state.currentLanguage];
    elements.wpmLabel.textContent = t.wpmLabel;
    elements.statWords.textContent = t.statWords;
    elements.statSeconds.textContent = t.statSeconds;
    elements.statEstimated.textContent = t.statEstimated;
    elements.resultlabel.textContent = t.resultLabel;
    
    if (!state.isReading) {
        elements.startBtnText.textContent = t.startBtn;
    }
}



function loadRandomText() {
    const textsArray = state.texts[state.currentLanguage];
    if (textsArray && textsArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * textsArray.length);
        state.currentText = textsArray[randomIndex];
        elements.paragraphText.textContent = 'Press Start to begin reading';
    } else {
        elements.paragraphText.textContent = `No texts available for ${state.currentLanguage}`;
    }
}

function countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateAvgWpm() {
    if (state.results.length === 0) return 0;
    const totalWpm = state.results.reduce((sum, result) => sum + result.wpm, 0);
    return Math.round(totalWpm / state.results.length);
}

function updateAvgWpmDisplay() {
    const avgWpm = calculateAvgWpm();
    elements.avgWpm.textContent = avgWpm > 0 ? avgWpm : '—';
}

function startReading() {
    state.isReading = true;
    state.startTime = Date.now();
    
    elements.paragraphText.textContent = state.currentText;
    
    const t = translations[state.currentLanguage];
    elements.startBtnText.textContent = t.stopBtn;
    
    const wordCount = countWords(state.currentText);
    elements.wordCount.textContent = wordCount;
    elements.seconds.textContent = '0';
    
    state.timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        elements.seconds.textContent = elapsedSeconds;
        
        const avgWpm = calculateAvgWpm();
        if (avgWpm > 0 && elapsedSeconds > 0) {
            const wordsPerSecond = avgWpm / 60;
            const estimatedTotal = Math.round(wordCount / wordsPerSecond);
            elements.estimated.textContent = `${estimatedTotal}s`;
        } else {
            elements.estimated.textContent = '—';
        }
    }, 100);
}

function stopReading() {
    state.isReading = false;
    clearInterval(state.timerInterval);
    
    const elapsedSeconds = (Date.now() - state.startTime) / 1000;
    const wordCount = countWords(state.currentText);
    const wpm = Math.round((wordCount / elapsedSeconds) * 60);
    
    const result = {
        text: state.currentText,
        seconds: Math.round(elapsedSeconds * 10) / 10,
        wpm: wpm,
        language: state.currentLanguage,
        timestamp: Date.now()
    };
    
    state.results.unshift(result);
    displayResults();
    updateAvgWpmDisplay();
    
    const t = translations[state.currentLanguage];
    elements.startBtnText.textContent = t.startBtn;
    
    loadRandomText();
    elements.wordCount.textContent = '0';
    elements.seconds.textContent = '0';
    elements.estimated.textContent = '—';
}
function toggleReading() {
    if (state.isReading) {
        stopReading();
    } else {
        startReading();
    }
}

function displayResults() {
    if (state.results.length === 0) {
        elements.resultsContainer.style.display = 'none';
        return;
    }
    
    elements.resultsContainer.style.display = 'block';
    const avgWpm = calculateAvgWpm();
    
    const resultsHTML = state.results.map(result => {
        const preview = result.text.substring(0, 60) + (result.text.length > 60 ? '…' : '');
        let wpmClass = 'result-wpm-neutral';
        if (avgWpm > 0) {
            wpmClass = result.wpm >= avgWpm ? 'result-wpm-good' : 'result-wpm-bad';
        }
        
        return `
            <div class="result-item">
                <span class="result-preview">${preview}</span>
                <span class="result-seconds">${result.seconds}s</span>
                <span class="result-wpm ${wpmClass}">${result.wpm} WPM</span>
            </div>
        `;
    }).join('');
    
    elements.resultsList.innerHTML = resultsHTML;
}

function changeLanguage(lang) {
    state.currentLanguage = lang;
    
    const allLanguageButtons = document.querySelectorAll('.language-btn');
    allLanguageButtons.forEach(btn => {
        btn.classList.remove('language-btn-active');
        btn.classList.add('language-btn-inactive');
    });
    
    const selectedButton = document.getElementById(`lang-${lang}`);
    if (selectedButton) {
        selectedButton.classList.add('language-btn-active');
        selectedButton.classList.remove('language-btn-inactive');
    }
    
    updateUILanguage();
    
    if (!state.isReading) {
        loadRandomText();
    }
}

// Event listeners
elements.startBtn.addEventListener('click', toggleReading);
elements.langEn.addEventListener('click', () => changeLanguage('en'));
elements.langEs.addEventListener('click', () => changeLanguage('es'));
elements.langRu.addEventListener('click', () => changeLanguage('ru'));
elements.langDe.addEventListener('click', () => changeLanguage('de'));
elements.langFr.addEventListener('click', () => changeLanguage('fr'));


document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleReading();
    }
});

loadTexts();