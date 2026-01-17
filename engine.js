/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v1.6
 * Focus: Viral Marketing (Image Generation), Revenue, Standalone
 */

const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        descriptions: {},
        lang: 'en',
        results: null // 이미지 생성을 위해 결과 저장
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
        
        ui.questionText.innerHTML = `<div style="font-size: 1.3rem; font-weight: bold; margin-bottom:20px;">${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';

        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.style.cssText = "width:100%; padding:15px; margin:8px 0; font-size:1.1rem; cursor:pointer; border-radius:10px; border:1px solid #ddd; background:white;";
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
        ui.mainContent.innerHTML = `
            <div style="padding: 40px 0; text-align: center;">
                <h3 style="font-size: 1.4rem;">${state.lang === 'ko' ? '심리 프로파일 분석 중...' : 'Analyzing Profile...'}</h3>
                <div id="ad-processing" style="margin:20px 0; min-height:100px; background:#f9f9f9; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center;">
                    <p style="font-size:0.8rem; color:#999;">ADVERTISEMENT</p>
                </div>
            </div>`;
        
        setTimeout(renderFinalReport, 3000);
    };

    const renderFinalReport = () => {
        const scores = calculateScores();
        state.results = scores; // 상태 저장

        const traits = {
            E: { ko: "외향성", en: "Extraversion" },
            A: { ko: "친화성", en: "Agreeableness" },
            C: { ko: "성실성", en: "Conscientiousness" },
            N: { ko: "신경증", en: "Neuroticism" },
            O: { ko: "개방성", en: "Openness" }
        };

        let reportHtml = `
            <div class="result-card" style="text-align:left;">
                <h2 style="text-align:center; color:#2c3e50;">${state.lang === 'ko' ? '인사이트 리포트' : 'Insight Report'}</h2>
                <div id="ad-result-top" style="margin:15px 0; min-height:50px; background:#f9f9f9; text-align:center; border:1px dashed #eee; font-size:0.7rem; color:#ccc;">AD</div>
        `;

        for (const [trait, data] of Object.entries(scores)) {
            const traitName = traits[trait][state.lang];
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            const desc = percentage >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low;

            reportHtml += `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>${traitName}</span><span>${percentage}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #eee; border-radius: 4px; margin: 5px 0;">
                        <div style="width: ${percentage}%; height: 100%; background: #3498db; border-radius: 4px;"></div>
                    </div>
                    <p style="font-size: 0.9rem; color: #555; line-height: 1.4;">${desc}</p>
                </div>`;
        }

        reportHtml += `
                <div style="margin-top: 30px;">
                    <button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:15px; background:#3498db; color:white; border:none; border-radius:8px; font-size:1.1rem; cursor:pointer; margin-bottom:10px; font-weight:bold;">
                        📸 ${state.lang === 'ko' ? '결과 이미지로 저장/공유' : 'Save/Share as Image'}
                    </button>
                    <button onclick="location.reload()" style="width:100%; padding:12px; background:#95a5a6; color:white; border:none; border-radius:8px; font-size:1rem; cursor:pointer;">
                        ${state.lang === 'ko' ? '새로고침 (데이터 파기)' : 'Restart (Purge Data)'}
                    </button>
                </div>
            </div>
            <canvas id="resultCanvas" style="display:none;"></canvas>
        `;

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

    /**
     * 이미지 생성 엔진 (Canvas API)
     */
    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        
        // 이미지 규격 (인스타그램/모바일 최적화)
        canvas.width = 600;
        canvas.height = 800;

        // 1. 배경 그리기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 상단 그라데이션 바
        const grad = ctx.createLinearGradient(0, 0, 600, 0);
        grad.addColorStop(0, '#3498db');
        grad.addColorStop(1, '#2c3e50');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 80);

        // 2. 타이틀
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GIPPP Insight Report', 300, 50);

        // 3. 데이터 시각화
        const traits = { E: "Extraversion", A: "Agreeableness", C: "Conscientiousness", N: "Neuroticism", O: "Openness" };
        let yOffset = 180;

        Object.entries(state.results).forEach(([trait, data]) => {
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            
            // 라벨
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(traits[trait], 50, yOffset);
            ctx.textAlign = 'right';
            ctx.fillText(`${percentage}%`, 550, yOffset);

            // 막대 그래프
            ctx.fillStyle = '#eee';
            ctx.roundRect ? ctx.fillRoundedRect(50, yOffset + 15, 500, 15, 7) : ctx.fillRect(50, yOffset + 15, 500, 15);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(50, yOffset + 15, (500 * percentage) / 100, 15);

            yOffset += 100;
        });

        // 4. 하단 브랜딩 및 URL
        ctx.fillStyle = '#95a5a6';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Analyze your mind at: gippp-project.github.io', 300, 750);

        // 5. 이미지 다운로드 실행
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `GIPPP_Result_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    };

    return { init, generateImage };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
