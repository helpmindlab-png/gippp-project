const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        lang: 'en'
    };

    // 성격 특성 정의 (Big Five)
    const traitsInfo = {
        ko: {
            E: "외향성 (Extraversion)",
            A: "친화성 (Agreeableness)",
            C: "성실성 (Conscientiousness)",
            N: "신경증 (Neuroticism)",
            O: "개방성 (Openness)"
        },
        en: {
            E: "Extraversion",
            A: "Agreeableness",
            C: "Conscientiousness",
            N: "Neuroticism",
            O: "Openness"
        }
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    const init = async () => {
        const userLang = navigator.language.substring(0, 2);
        state.lang = ['ko', 'en'].includes(userLang) ? userLang : 'en';
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            state.questions = await response.json();
            render();
        } catch (e) { ui.questionText.innerText = "Error loading data."; }
    };

    const render = () => {
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
            btn.onclick = () => {
                // 역채점 로직 적용
                const finalScore = q.direction === "-" ? 6 - score : score;
                state.answers.push({ trait: q.trait, score: finalScore });
                
                if (++state.currentIndex < state.questions.length) render();
                else showResult();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showResult = () => {
        ui.mainContent.innerHTML = `<h3>${state.lang === 'ko' ? '심리 프로파일 생성 중...' : 'Generating Profile...'}</h3>`;
        
        setTimeout(() => {
            // 1. 특성별 점수 합산
            const scores = state.answers.reduce((acc, curr) => {
                acc[curr.trait] = (acc[curr.trait] || 0) + curr.score;
                return acc;
            }, {});

            // 2. 결과 리포트 생성
            let reportHtml = `<div class="result-card"><h2>${state.lang === 'ko' ? '당신의 인사이트 리포트' : 'Your Insight Report'}</h2>`;
            
            for (const [trait, score] of Object.entries(scores)) {
                const traitName = traitsInfo[state.lang][trait];
                const percentage = (score / (state.answers.filter(a => a.trait === trait).length * 5)) * 100;
                
                reportHtml += `
                    <div class="trait-row">
                        <strong>${traitName}</strong>
                        <div class="bar-bg"><div class="bar-fill" style="width: ${percentage}%"></div></div>
                        <span>${Math.round(percentage)}%</span>
                    </div>`;
            }

            reportHtml += `<button class="exit-btn" onclick="location.reload()">${state.lang === 'ko' ? '안전하게 종료' : 'Secure Exit'}</button></div>`;
            ui.mainContent.innerHTML = reportHtml;
        }, 3000);
    };

    return { init };
})();
GIPPP_ENGINE.init();
