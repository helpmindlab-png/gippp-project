const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [], // JSON에서 동적으로 로드됨
        lang: 'en'     // 기본값
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    // 1. 언어 감지 및 JSON 로드
    const init = async () => {
        const userLang = navigator.language.substring(0, 2); // 'ko', 'en' 등 추출
        state.lang = ['ko', 'en'].includes(userLang) ? userLang : 'en';
        
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            state.questions = await response.json();
            render();
        } catch (error) {
            console.error("Data load failed:", error);
            ui.questionText.innerText = "데이터를 불러오는 데 실패했습니다.";
        }
    };

    // 2. 질문 렌더링
    const render = () => {
        if (state.questions.length === 0) return;
        
        const q = state.questions[state.currentIndex];
        ui.questionText.innerText = q.text;
        ui.optionsGroup.innerHTML = '';

        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = labels[score-1];
            btn.onclick = () => handleAnswer(score);
            ui.optionsGroup.appendChild(btn);
        });

        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const handleAnswer = (score) => {
        state.answers.push({ trait: state.questions[state.currentIndex].trait, score });
        if (++state.currentIndex < state.questions.length) {
            render();
        } else {
            showResult();
        }
    };

    // 3. 결과 출력 (수익화 대기 시간 포함)
    const showResult = () => {
        const loadingMsg = state.lang === 'ko' ? "분석 중..." : "Analyzing...";
        ui.mainContent.innerHTML = `<h3>${loadingMsg}</h3>`;
        
        setTimeout(() => {
            const title = state.lang === 'ko' ? "분석 결과" : "Analysis Result";
            const exitTxt = state.lang === 'ko' ? "데이터 파기 및 종료" : "Purge Data & Exit";
            
            ui.mainContent.innerHTML = `
                <div class="result-card">
                    <h4>${title}</h4>
                    <ul>${state.answers.map(a => `<li>${a.trait}: ${a.score}</li>`).join('')}</ul>
                    <button class="exit-btn" onclick="location.reload()">${exitTxt}</button>
                </div>`;
        }, 2500);
    };

    return { init };
})();

// 엔진 가동
GIPPP_ENGINE.init();
