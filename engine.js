/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v2.0
 * Focus: Image Localization, QR Code Offloading, Full UI Sync
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

    const uiStrings = {
        ko: {
            desc: "글로벌 인사이트 프로파일러 프로젝트",
            security: "🔒 보안 안내: 본 시스템은 어떠한 데이터도 서버에 저장하지 않으며, 창을 닫는 즉시 모든 분석 데이터는 파기됩니다.",
            loading: "데이터 엔진 로딩 중...",
            processing: "정밀 프로파일 분석 중...",
            wait: "데이터셋 대조를 위해 잠시만 기다려 주세요.",
            saveImg: "📸 결과 이미지로 저장",
            retest: "다시 테스트하기",
            reportTitle: "인사이트 리포트",
            qrNote: "📱 스마트폰으로 스캔하여 결과를 소장하세요",
            traits: { E: "외향성", A: "친화성", C: "성실성", N: "신경증", O: "개방성" }
        },
        en: {
            desc: "Global Insight Profiler Project",
            security: "🔒 Security Notice: This system does not store any data on the server. All data is destroyed immediately upon closing.",
            loading: "Loading data engine...",
            processing: "Generating Deep Profile...",
            wait: "Comparing with global datasets...",
            saveImg: "📸 Save as Image",
            retest: "Retest",
            reportTitle: "Insight Report",
            qrNote: "📱 Scan to take your results with you",
            traits: { E: "Extraversion", A: "Agreeableness", C: "Conscientiousness", N: "Neuroticism", O: "Openness" }
        }
    };

    const ui = {
        brandDesc: document.getElementById('brand-desc'),
        securityNote: document.getElementById('security-note'),
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const forcedLang = urlParams.get('lang');
        state.lang = (forcedLang && uiStrings[forcedLang]) ? forcedLang : (navigator.language.substring(0, 2) === 'ko' ? 'ko' : 'en');

        const strings = uiStrings[state.lang];
        ui.brandDesc.innerText = strings.desc;
        ui.securityNote.innerText = strings.security;
        ui.questionText.innerText = strings.loading;
        
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            const data = await response.json();
            state.questions = data.items;
            state.descriptions = data.descriptions;
            renderQuestion();
        } catch (error) { ui.questionText.innerText = "Data Load Error."; }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        ui.questionText.innerHTML = `
            <div style="font-size: 0.9rem; color: #3498db; margin-bottom: 5px;">Question ${state.currentIndex + 1} / ${state.questions.length}</div>
            <div style="font-size: 1.3rem; font-weight: bold; line-height: 1.4;">${q.text}</div>
        `;
        ui.optionsGroup.innerHTML = '';
        const labels = state.lang === 'ko' ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"] : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.style.cssText = "width:100%; padding:16px; margin:10px 0; font-size:1.1rem; cursor:pointer; border-radius:12px; border:1px solid #ddd; background:white;";
            btn.innerText = labels[score - 1];
            btn.onclick = () => {
                const finalScore = (q.direction === "-") ? (6 - score) : score;
                state.answers.push({ trait: q.trait, score: finalScore });
                if (++state.currentIndex < state.questions.length) { renderQuestion(); window.scrollTo(0, 0); }
                else showProcessing();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        const strings = uiStrings[state.lang];
        ui.mainContent.innerHTML = `<div style="padding: 50px 0; text-align: center;"><div class="spinner" style="margin: 0 auto 20px;"></div><h3 style="font-size: 1.4rem;">${strings.processing}</h3><p style="color: #666;">${strings.wait}</p></div>`;
        setTimeout(renderFinalReport, 3000);
    };

    const renderFinalReport = () => {
        const scores = calculateScores();
        state.results = scores;
        const strings = uiStrings[state.lang];

        let reportHtml = `<div class="result-card" style="text-align:left;"><h2 style="text-align:center; color:#2c3e50; border-bottom:3px solid #3498db; padding-bottom:15px;">${strings.reportTitle}</h2>`;

        for (const [trait, data] of Object.entries(scores)) {
            const traitName = strings.traits[trait];
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            const desc = percentage >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low;

            reportHtml += `
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size:1.1rem;"><span>${traitName}</span><span>${percentage}%</span></div>
                    <div style="width: 100%; height: 12px; background: #eee; border-radius: 6px; margin: 8px 0; overflow:hidden;"><div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); border-radius: 6px;"></div></div>
                    <p style="font-size: 0.95rem; color: #444; line-height: 1.6;">${desc}</p>
                </div>`;
        }

        // QR 코드 영역 추가
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
        
        reportHtml += `
                <div style="text-align:center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 15px;">
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">${strings.qrNote}</p>
                    <img src="${qrUrl}" alt="QR Code" style="border: 5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                </div>
                <div style="margin-top: 20px;">
                    <button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:18px; background:#3498db; color:white; border:none; border-radius:12px; font-size:1.1rem; cursor:pointer; margin-bottom:12px; font-weight:bold;">${strings.saveImg}</button>
                    <button onclick="location.reload()" style="width:100%; padding:15px; background:#f8f9fa; color:#7f8c8d; border:1px solid #ddd; border-radius:12px; font-size:1rem; cursor:pointer;">${strings.retest}</button>
                </div>
            </div><canvas id="resultCanvas" style="display:none;"></canvas>`;

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

    /**
     * 이미지 생성 (현지화 적용)
     */
    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const strings = uiStrings[state.lang];
        
        canvas.width = 600; canvas.height = 800;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 800);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 80);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(strings.reportTitle, 300, 50);

        let y = 180;
        Object.entries(state.results).forEach(([trait, data]) => {
            const traitName = strings.traits[trait];
            const p = Math.round((data.total / (data.count * 5)) * 100);
            
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(traitName, 50, y);
            ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 550, y);
            ctx.fillStyle = '#eee'; ctx.fillRect(50, y + 15, 500, 15);
            ctx.fillStyle = '#3498db'; ctx.fillRect(50, y + 15, (500 * p) / 100, 15);
            y += 100;
        });

        const link = document.createElement('a');
        link.download = `GIPPP_${state.lang}_Result.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return { init, generateImage };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
