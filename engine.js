/**
 * [Insight Profiler] Core Engine v2.5
 * Principles: Zero-Persistence, Standalone, High Readability
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
            security: "🔒 보안 안내: 본 시스템은 데이터를 저장하지 않습니다. QR코드나 이미지를 통해 결과를 소장하세요.",
            loading: "데이터 엔진 로딩 중...",
            processing: "정밀 프로파일 분석 중...",
            wait: "데이터셋 대조를 위해 잠시만 기다려 주세요.",
            saveImg: "📸 결과 이미지로 저장 (QR포함)",
            retest: "새로운 테스트 시작하기",
            reportTitle: "인사이트 리포트",
            qrNote: "📱 이 QR을 스캔하면 결과를 소장할 수 있습니다",
            recommendTitle: "💡 당신을 위한 맞춤 추천",
            viewAmazon: "아마존에서 보기",
            traits: { E: "외향성", A: "친화성", C: "성실성", N: "신경증", O: "개방성" }
        },
        en: {
            desc: "Global Insight Profiler Project",
            security: "🔒 Security: No data stored on server. Save results via QR or Image.",
            loading: "Loading data engine...",
            processing: "Generating Deep Profile...",
            wait: "Comparing with global datasets...",
            saveImg: "📸 Save as Image (with QR)",
            retest: "Start New Test",
            reportTitle: "Insight Report",
            qrNote: "📱 Scan to take your results with you",
            recommendTitle: "💡 Recommended for You",
            viewAmazon: "View on Amazon",
            traits: { E: "Extraversion", A: "Agreeableness", C: "Conscientiousness", N: "Neuroticism", O: "Openness" }
        }
    };

    const amazonProducts = {
        E: { ko: "사교성을 높여주는 파티 게임", en: "Party Games for Socializing", keyword: "party games" },
        A: { ko: "마음을 전하는 따뜻한 선물 세트", en: "Thoughtful Gift Sets", keyword: "gift sets" },
        C: { ko: "생산성을 높여주는 플래너", en: "Productivity Planners", keyword: "productivity planner" },
        N: { ko: "스트레스 완화를 위한 명상 도구", en: "Meditation & Stress Relief", keyword: "meditation kit" },
        O: { ko: "창의력을 자극하는 예술 용품", en: "Creative Art Supplies", keyword: "art supplies" }
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
        if(ui.brandDesc) ui.brandDesc.innerText = strings.desc;
        if(ui.securityNote) ui.securityNote.innerText = strings.security;

        await loadData();

        const resData = urlParams.get('res');
        if (resData) decodeAndShowResult(resData);
        else renderQuestion();
    };

    const loadData = async () => {
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            if (!response.ok) throw new Error("File not found");
            const data = await response.json();
            state.questions = data.items;
            state.descriptions = data.descriptions;
        } catch (e) { 
            ui.questionText.innerText = "Data Load Error. Check JSON structure."; 
            console.error(e);
        }
    };

    const renderQuestion = () => {
        if (!state.questions || !state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        ui.questionText.innerHTML = `
            <div style="font-size: 1rem; color: #3498db; margin-bottom: 10px;">Question ${state.currentIndex + 1} / ${state.questions.length}</div>
            <div style="min-height: 80px; display: flex; align-items: center; justify-content: center;">${q.text}</div>
        `;
        ui.optionsGroup.innerHTML = '';
        const labels = state.lang === 'ko' ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"] : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
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
        const strings = uiStrings[state.lang];
        ui.mainContent.innerHTML = `
            <div style="padding: 40px 0;">
                <div class="spinner"></div>
                <h3 style="font-size: 1.5rem;">${strings.processing}</h3>
                <p style="color: #666;">${strings.wait}</p>
                <div id="ad-processing" style="margin-top:30px; min-height:200px; background:#f9f9f9; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center;">
                    <p style="font-size:0.8rem; color:#999;">ADVERTISEMENT SLOT</p>
                </div>
            </div>`;
        setTimeout(() => {
            state.results = calculateScores();
            renderFinalReport();
        }, 3500);
    };

    const calculateScores = () => {
        return state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score;
            acc[curr.trait].count += 1;
            return acc;
        }, {});
    };

    const renderFinalReport = () => {
        const strings = uiStrings[state.lang];
        const resCode = encodeResults();
        const shareUrl = `${window.location.origin}${window.location.pathname}?lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

        let maxTrait = 'O'; let maxScore = -1;
        const traitPercentages = {};
        for (const [trait, data] of Object.entries(state.results)) {
            const p = data.count === 20 ? data.total : Math.round((data.total / (data.count * 5)) * 100);
            traitPercentages[trait] = p;
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
        }

        let reportHtml = `
            <div class="result-card">
                <h2 style="text-align:center; color:#2c3e50; border-bottom:4px solid #3498db; padding-bottom:15px; font-size:1.8rem;">${strings.reportTitle}</h2>
                <div id="ad-result-top" style="margin:15px 0; min-height:60px; background:#f9f9f9; text-align:center; border:1px dashed #eee; font-size:0.7rem; color:#ccc;">AD SLOT (TOP)</div>
        `;

        for (const [trait, p] of Object.entries(traitPercentages)) {
            const traitName = strings.traits[trait];
            const desc = p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low;
            reportHtml += `
                <div style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size:1.2rem;"><span>${traitName}</span><span>${p}%</span></div>
                    <div style="width: 100%; height: 15px; background: #eee; border-radius: 8px; margin: 8px 0; overflow:hidden;"><div style="width: ${p}%; height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); border-radius: 8px;"></div></div>
                    <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">${desc}</p>
                </div>`;
        }

        const product = amazonProducts[maxTrait];
        reportHtml += `
            <div style="margin: 30px 0; padding: 20px; background: #fff9e6; border-radius: 20px; border: 2px solid #ffcc00; text-align:center;">
                <h4 style="margin:0 0 10px 0; color:#e67e22;">${strings.recommendTitle}</h4>
                <p style="font-size:1.1rem; font-weight:bold; margin-bottom:15px;">${product[state.lang]}</p>
                <a href="https://www.amazon.com/s?k=${encodeURIComponent(product.keyword)}" target="_blank" style="display:inline-block; padding:12px 25px; background:#ff9900; color:white; text-decoration:none; border-radius:10px; font-weight:bold;">${strings.viewAmazon}</a>
            </div>
            <div id="ad-result-bottom" style="margin:20px 0; min-height:100px; background:#f9f9f9; text-align:center; border:1px dashed #eee; font-size:0.7rem; color:#ccc;">AD SLOT (BOTTOM)</div>
            <div style="text-align:center; margin: 30px 0; padding: 20px; background: #f0f7ff; border-radius: 20px; border: 2px solid #d0e3ff;">
                <p style="font-size: 1rem; color: #0056b3; margin-bottom: 15px; font-weight:bold;">${strings.qrNote}</p>
                <img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous" alt="QR Code" style="border: 8px solid white; width:150px; height:150px;">
            </div>
            <button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:20px; background:#3498db; color:white; border:none; border-radius:15px; font-size:1.3rem; cursor:pointer; margin-bottom:15px; font-weight:bold;">${strings.saveImg}</button>
            <button onclick="location.href=window.location.pathname" style="width:100%; padding:15px; background:#f8f9fa; color:#7f8c8d; border:1px solid #ddd; border-radius:15px; font-size:1.1rem; cursor:pointer;">${strings.retest}</button>
        </div><canvas id="resultCanvas" style="display:none;"></canvas>`;

        ui.mainContent.innerHTML = reportHtml;
        window.scrollTo(0, 0);
    };

    const encodeResults = () => {
        if (!state.results) return "";
        return Object.entries(state.results).map(([trait, data]) => {
            const p = data.count === 20 ? data.total : Math.round((data.total / (data.count * 5)) * 100);
            return trait + p;
        }).join('');
    };

    const decodeAndShowResult = (code) => {
        const scores = {};
        const matches = code.match(/([EACNO])(\d+)/g);
        if (matches) {
            matches.forEach(m => { scores[m[0]] = { total: parseInt(m.substring(1)), count: 20 }; });
            state.results = scores;
            renderFinalReport();
        }
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const strings = uiStrings[state.lang];
        const qrImg = document.getElementById('qrImage');
        if (!qrImg || !qrImg.complete) return;

        canvas.width = 600; canvas.height = 950;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 950);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 120);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(strings.reportTitle, 300, 75);

        let y = 220;
        Object.entries(state.results).forEach(([trait, data]) => {
            const p = data.count === 20 ? data.total : Math.round((data.total / (data.count * 5)) * 100);
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(strings.traits[trait], 60, y);
            ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y);
            ctx.fillStyle = '#eee'; ctx.fillRect(60, y + 20, 480, 25);
            ctx.fillStyle = '#3498db'; ctx.fillRect(60, y + 20, (480 * p) / 100, 25);
            y += 110;
        });

        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 750, 600, 200);
        try { ctx.drawImage(qrImg, 50, 775, 150, 150); } catch (e) {}
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(state.lang === 'ko' ? '당신의 인사이트가 궁금하다면?' : 'Curious about your insight?', 220, 830);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '18px sans-serif';
        ctx.fillText(state.lang === 'ko' ? 'QR코드를 스캔하여 테스트 시작' : 'Scan QR to start your test', 220, 865);
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#3498db';
        ctx.fillText('gippp-project.github.io', 220, 895);

        const link = document.createElement('a');
        link.download = `Result_${state.lang}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
