/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v1.5
 * Focus: Revenue Optimization, Expert Curation, High Readability
 */

const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        descriptions: {},
        lang: 'en'
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    const init = async () => {
        const userLang = navigator.language.substring(0, 2);
        state.lang = (userLang === 'ko') ? 'ko' : 'en';
        
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            const data = await response.json();
            state.questions = data.items;
            state.descriptions = data.descriptions;
            renderQuestion();
        } catch (error) {
            ui.questionText.innerText = "Data Load Error.";
        }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        
        // 가독성 강화: 큰 폰트 적용
        ui.questionText.innerHTML = `<div style="font-size: 1.3rem; font-weight: bold; margin-bottom:20px;">${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';

        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.style.cssText = "width:100%; padding:15px; margin:8px 0; font-size:1.1rem; cursor:pointer;";
            btn.innerText = labels[score - 1];
            btn.onclick = () => {
                const finalScore = (q.direction === "-") ? (6 - score) : score;
                state.answers.push({ trait: q.trait, score: finalScore });
                if (++state.currentIndex < state.questions.length) renderQuestion();
                else showProcessing();
            };
            ui.optionsGroup.appendChild(btn);
        });

        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        // 수익화 포인트: 결과 도출 전 전면 광고가 들어갈 자리
        ui.mainContent.innerHTML = `
            <div style="padding: 40px 0; text-align: center;">
                <div class="spinner"></div>
                <h3 style="font-size: 1.4rem;">${state.lang === 'ko' ? '심리 프로파일 분석 중...' : 'Analyzing Profile...'}</h3>
                <p style="color: #666;">${state.lang === 'ko' ? '잠시만 기다려 주세요.' : 'Please wait a moment.'}</p>
                <!-- AD SLOT: 결과 대기 중 광고 -->
                <div id="ad-processing" style="margin-top:20px; min-height:100px; background:#f9f9f9; border:1px dashed #ccc;">
                    <p style="font-size:0.8rem; color:#999; padding-top:40px;">ADVERTISEMENT</p>
                </div>
            </div>`;
        
        setTimeout(renderFinalReport, 3500); // 광고 노출을 위해 3.5초 대기
    };

    const renderFinalReport = () => {
        const scores = calculateScores();
        const traits = {
            E: { ko: "외향성", en: "Extraversion" },
            A: { ko: "친화성", en: "Agreeableness" },
            C: { ko: "성실성", en: "Conscientiousness" },
            N: { ko: "신경증", en: "Neuroticism" },
            O: { ko: "개방성", en: "Openness" }
        };

        let reportHtml = `
            <div class="result-card" style="text-align:left;">
                <h2 style="text-align:center; border-bottom:2px solid #3498db; padding-bottom:10px;">
                    ${state.lang === 'ko' ? '인사이트 리포트' : 'Insight Report'}
                </h2>
                <!-- AD SLOT: 결과 상단 광고 -->
                <div id="ad-result-top" style="margin:20px 0; min-height:50px; background:#f9f9f9; text-align:center; border:1px dashed #eee;">
                    <span style="font-size:0.7rem; color:#ccc;">AD</span>
                </div>
        `;

        for (const [trait, data] of Object.entries(scores)) {
            const traitName = traits[trait][state.lang];
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            const desc = percentage >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low;

            reportHtml += `
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size:1.1rem;">
                        <span>${traitName}</span><span>${percentage}%</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: #eee; border-radius: 5px; margin: 8px 0;">
                        <div style="width: ${percentage}%; height: 100%; background: #3498db; border-radius: 5px;"></div>
                    </div>
                    <p style="font-size: 0.95rem; color: #444; line-height: 1.5; margin-top: 5px;">${desc}</p>
                </div>`;
        }

        reportHtml += `
                <!-- AD SLOT: 결과 하단 광고 -->
                <div id="ad-result-bottom" style="margin:20px 0; min-height:100px; background:#f9f9f9; text-align:center; border:1px dashed #eee;">
                    <span style="font-size:0.7rem; color:#ccc;">AD</span>
                </div>
                <button class="exit-btn" style="width:100%; padding:15px; background:#e74c3c; color:white; border:none; border-radius:8px; font-size:1.1rem; cursor:pointer;" onclick="location.reload()">
                    ${state.lang === 'ko' ? '분석 종료 및 데이터 파기' : 'Exit & Purge Data'}
                </button>
            </div>`;

        ui.mainContent.innerHTML = reportHtml;
    };

    const calculateScores = () => {
        return state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score;
            acc[curr.trait].count += 1;
            return acc;
        }, {});
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
