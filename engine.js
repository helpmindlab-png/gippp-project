/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v1.8
 * Focus: URL Parameter Routing (Force Language), Stability, High Readability
 */

const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        descriptions: {},
        lang: 'en',
        results: null
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    /**
     * 초기화: URL 파라미터(?lang=) 확인 후 언어 결정
     */
    const init = async () => {
        // 1. URL에서 lang 파라미터 추출 (예: ?lang=en)
        const urlParams = new URLSearchParams(window.location.search);
        const forcedLang = urlParams.get('lang');

        if (forcedLang && ['ko', 'en'].includes(forcedLang)) {
            state.lang = forcedLang;
        } else {
            // 2. 파라미터가 없으면 브라우저 언어 감지
            const userLang = navigator.language.substring(0, 2);
            state.lang = (userLang === 'ko') ? 'ko' : 'en';
        }
        
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            const data = await response.json();
            state.questions = data.items;
            state.descriptions = data.descriptions;
            renderQuestion();
        } catch (error) {
            ui.questionText.innerText = "Data Load Error. Please check JSON files.";
        }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        
        ui.questionText.innerHTML = `
            <div style="font-size: 0.9rem; color: #3498db; margin-bottom: 5px;">Question ${state.currentIndex + 1} / ${state.questions.length}</div>
            <div style="font-size: 1.3rem; font-weight: bold; line-height: 1.4;">${q.text}</div>
        `;
        
        ui.optionsGroup.innerHTML = '';

        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.style.cssText = "width:100%; padding:16px; margin:10px 0; font-size:1.1rem; cursor:pointer; border-radius:12px; border:1px solid #ddd; background:white;";
            btn.innerText = labels[score - 1];
            btn.onclick = () => {
                const finalScore = (q.direction === "-") ? (6 - score) : score;
                state.answers.push({ trait: q.trait, score: finalScore });
                if (++state.currentIndex < state.questions.length) {
                    renderQuestion();
                    window.scrollTo(0, 0);
                } else {
                    showProcessing();
                }
            };
            ui.optionsGroup.appendChild(btn);
        });

        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        ui.mainContent.innerHTML = `
            <div style="padding: 50px 0; text-align: center;">
                <div class="spinner" style="margin: 0 auto 20px;"></div>
                <h3 style="font-size: 1.4rem;">${state.lang === 'ko' ? '정밀 프로파일 분석 중...' : 'Generating Deep Profile...'}</h3>
                <div id="ad-processing" style="margin-top:30px; min-height:150px; background:#fdfdfd; border:1px dashed #ddd; display:flex; align-items:center; justify-content:center;">
                    <p style="font-size:0.8rem; color:#bbb;">ADVERTISEMENT</p>
                </div>
            </div>`;
        
        setTimeout(renderFinalReport, 3000);
    };

    const renderFinalReport = () => {
        const scores = calculateScores();
        state.results = scores;

        const traits = {
            E: { ko: "외향성", en: "Extraversion" },
            A: { ko: "친화성", en: "Agreeableness" },
            C: { ko: "성실성", en: "Conscientiousness" },
            N: { ko: "신경증", en: "Neuroticism" },
            O: { ko: "개방성", en: "Openness" }
        };

        let reportHtml = `
            <div class="result-card" style="text-align:left;">
                <h2 style="text-align:center; color:#2c3e50; border-bottom:3px solid #3498db; padding-bottom:15px;">
                    ${state.lang === 'ko' ? '인사이트 리포트' : 'Insight Report'}
                </h2>
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
                    <div style="width: 100%; height: 12px; background: #eee; border-radius: 6px; margin: 8px 0; overflow:hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); border-radius: 6px;"></div>
                    </div>
                    <p style="font-size: 0.95rem; color: #444; line-height: 1.6;">${desc}</p>
                </div>`;
        }

        reportHtml += `
                <div style="margin-top: 35px;">
                    <button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:18px; background:#3498db; color:white; border:none; border-radius:12px; font-size:1.1rem; cursor:pointer; margin-bottom:12px; font-weight:bold;">
                        📸 ${state.lang === 'ko' ? '결과 이미지로 저장' : 'Save as Image'}
                    </button>
                    <button onclick="location.reload()" style="width:100%; padding:15px; background:#f8f9fa; color:#7f8c8d; border:1px solid #ddd; border-radius:12px; font-size:1rem; cursor:pointer;">
                        ${state.lang === 'ko' ? '다시 테스트하기' : 'Retest'}
                    </button>
                </div>
            </div>
            <canvas id="resultCanvas" style="display:none;"></canvas>
        `;

        ui.mainContent.innerHTML = reportHtml;
        window.scrollTo(0, 0);
    };

    const calculateScores = () => {
        return state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score;
            acc[curr.trait].count += 1;
            return acc;
        }, {});
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600; canvas.height = 800;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 800);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 80);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GIPPP Insight Report', 300, 50);

        const traits = { E: "Extraversion", A: "Agreeableness", C: "Conscientiousness", N: "Neuroticism", O: "Openness" };
        let y = 180;
        Object.entries(state.results).forEach(([trait, data]) => {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(traits[trait], 50, y);
            ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 550, y);
            ctx.fillStyle = '#eee'; ctx.fillRect(50, y + 15, 500, 15);
            ctx.fillStyle = '#3498db'; ctx.fillRect(50, y + 15, (500 * p) / 100, 15);
            y += 100;
        });

        const link = document.createElement('a');
        link.download = `GIPPP_Result.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return { init, generateImage };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
