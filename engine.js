const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [
            { text: "나는 새로운 환경에서도 금방 적응하는 편이다.", trait: "Adaptability" },
            { text: "나는 결정을 내릴 때 논리보다 직관을 믿는다.", trait: "Intuition" },
            { text: "나는 스트레스 상황에서 평정심을 잘 유지한다.", trait: "Stability" }
        ]
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    const render = () => {
        const q = state.questions[state.currentIndex];
        ui.questionText.innerText = q.text;
        ui.optionsGroup.innerHTML = '';
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"][score-1];
            btn.onclick = () => {
                state.answers.push({ trait: q.trait, score });
                if (++state.currentIndex < state.questions.length) render();
                else showResult();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showResult = () => {
        ui.mainContent.innerHTML = `<h3>분석 완료. 결과를 생성 중입니다...</h3>`;
        setTimeout(() => {
            ui.mainContent.innerHTML = `
                <div class="result-card">
                    <h4>Your Insight Report</h4>
                    <p>분석된 성향 데이터:</p>
                    <ul>${state.answers.map(a => `<li>${a.trait}: ${a.score}점</li>`).join('')}</ul>
                    <button class="exit-btn" onclick="location.reload()">데이터 파기 및 종료</button>
                </div>`;
        }, 2000);
    };

    return { init: render };
})();
GIPPP_ENGINE.init();
