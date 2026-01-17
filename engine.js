/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v2.7
 * Features: Manual Language Switcher, Multi-Country Ready, Image/QR Sync
 */

const GIPPP_ENGINE = (() => {
    let state = { currentIndex: 0, answers: [], questions: [], descriptions: {}, lang: 'en', results: null };

    const uiStrings = {
        ko: { desc: "글로벌 인사이트 프로파일러", security: "🔒 보안: 데이터 저장 안 함", processing: "분석 중...", wait: "잠시만 기다려 주세요.", saveImg: "📸 이미지 저장", retest: "다시 하기", reportTitle: "인사이트 리포트", recommendTitle: "💡 맞춤 추천", viewAmazon: "아마존 보기", qrNote: "📱 스캔하여 결과 소장", traits: { E: "외향성", A: "친화성", C: "성실성", N: "신경증", O: "개방성" } },
        en: { desc: "Global Insight Profiler", security: "🔒 Security: No data stored", processing: "Analyzing...", wait: "Please wait...", saveImg: "📸 Save Image", retest: "Retest", reportTitle: "Insight Report", recommendTitle: "💡 Recommended", viewAmazon: "View on Amazon", qrNote: "📱 Scan to save results", traits: { E: "Extraversion", A: "Agreeableness", C: "Conscientiousness", N: "Neuroticism", O: "Openness" } },
        es: { desc: "Perfilador de Perspectiva Global", security: "🔒 Seguridad: Sin datos guardados", processing: "Analizando...", wait: "Por favor espere...", saveImg: "📸 Guardar Imagen", retest: "Reiniciar", reportTitle: "Informe de Perspectiva", recommendTitle: "💡 Recomendado", viewAmazon: "Ver en Amazon", qrNote: "📱 Escanea para guardar", traits: { E: "Extraversión", A: "Amabilidad", C: "Responsabilidad", N: "Neuroticismo", O: "Apertura" } },
        jp: { desc: "グローバル・インサイト・プロファイラー", security: "🔒 セキュリティ: データ保存なし", processing: "分析中...", wait: "少々お待ちください...", saveImg: "📸 画像을保存", retest: "再テスト", reportTitle: "インサイトレポート", recommendTitle: "💡 おすすめ商品", viewAmazon: "Amazonで見る", qrNote: "📱 スキャンして保存", traits: { E: "外向性", A: "協조性", C: "誠実性", N: "神経症傾向", O: "開放性" } }
    };

    const amazonProducts = { E: "party games", A: "gift sets", C: "planner", N: "meditation", O: "art supplies" };
    const ui = { brandDesc: document.getElementById('brand-desc'), securityNote: document.getElementById('security-note'), questionText: document.getElementById('question-text'), optionsGroup: document.getElementById('options-group'), progressFill: document.getElementById('progress-fill'), mainContent: document.getElementById('main-content'), langSelect: document.getElementById('lang-select') };

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const forcedLang = urlParams.get('lang');
        state.lang = (forcedLang && uiStrings[forcedLang]) ? forcedLang : (navigator.language.substring(0, 2) === 'ko' ? 'ko' : 'en');
        
        // UI 언어 설정 및 셀렉터 동기화
        const strings = uiStrings[state.lang];
        ui.brandDesc.innerText = strings.desc;
        ui.securityNote.innerText = strings.security;
        ui.langSelect.value = state.lang;

        await loadData();
        const resData = urlParams.get('res');
        if (resData) decodeAndShowResult(resData); else renderQuestion();
    };

    const changeLanguage = (newLang) => {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLang);
        window.location.href = url.toString();
    };

    const loadData = async () => {
        try {
            const response = await fetch(`./data/questions_${state.lang}.json`);
            const data = await response.json();
            state.questions = data.items;
            state.descriptions = data.descriptions;
        } catch (e) { ui.questionText.innerText = "Data Load Error."; }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        ui.questionText.innerHTML = `<div style="font-size:0.9rem; color:#3498db; margin-bottom:5px;">Q${state.currentIndex + 1} / ${state.questions.length}</div><div>${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';
        const labels = state.lang === 'ko' ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"] : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = labels[score - 1];
            btn.onclick = () => {
                state.answers.push({ trait: q.trait, score: q.direction === "-" ? 6 - score : score });
                if (++state.currentIndex < state.questions.length) renderQuestion(); else showProcessing();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        const strings = uiStrings[state.lang];
        ui.mainContent.innerHTML = `<div style="padding:40px 0;"><div class="spinner"></div><h3>${strings.processing}</h3><p>${strings.wait}</p></div>`;
        setTimeout(() => { state.results = calculateScores(); renderFinalReport(); }, 3000);
    };

    const calculateScores = () => state.answers.reduce((acc, curr) => {
        if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
        acc[curr.trait].total += curr.score; acc[curr.trait].count += 1;
        return acc;
    }, {});

    const renderFinalReport = () => {
        const strings = uiStrings[state.lang];
        const resCode = Object.entries(state.results).map(([t, d]) => t + Math.round((d.total / (d.count * 5)) * 100)).join('');
        const shareUrl = `${window.location.origin}${window.location.pathname}?lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;
        
        let maxTrait = 'O', maxScore = -1;
        let reportHtml = `<div class="result-card"><h2>${strings.reportTitle}</h2>`;
        for (const [trait, data] of Object.entries(state.results)) {
            const p = data.count === 20 ? data.total : Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            reportHtml += `<div style="margin-bottom:15px;"><strong>${strings.traits[trait]} ${p}%</strong><div style="width:100%; height:10px; background:#eee; border-radius:5px; overflow:hidden;"><div style="width:${p}%; height:100%; background:#3498db;"></div></div><p style="font-size:0.9rem;">${p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low}</p></div>`;
        }
        reportHtml += `<div style="background:#fff9e6; padding:15px; border-radius:15px; text-align:center; margin-bottom:20px;"><h4>${strings.recommendTitle}</h4><a href="https://www.amazon.com/s?k=${amazonProducts[maxTrait]}" target="_blank" style="color:#ff9900; font-weight:bold;">${strings.viewAmazon}</a></div>`;
        reportHtml += `<div style="text-align:center; margin-bottom:20px;"><p style="font-size:0.8rem;">${strings.qrNote}</p><img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous" style="width:120px; border:5px solid white;"></div>`;
        reportHtml += `<button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:18px; background:#3498db; color:white; border:none; border-radius:12px; font-weight:bold; margin-bottom:10px;">${strings.saveImg}</button>`;
        reportHtml += `<button onclick="location.href=window.location.pathname" style="width:100%; padding:12px; background:#eee; border:none; border-radius:10px;">${strings.retest}</button></div><canvas id="resultCanvas" style="display:none;"></canvas>`;
        ui.mainContent.innerHTML = reportHtml;
    };

    const decodeAndShowResult = (code) => {
        const scores = {};
        const matches = code.match(/([EACNO])(\d+)/g);
        if (matches) matches.forEach(m => { scores[m[0]] = { total: parseInt(m.substring(1)), count: 20 }; });
        state.results = scores; renderFinalReport();
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const qrImg = document.getElementById('qrImage');
        const strings = uiStrings[state.lang];
        canvas.width = 600; canvas.height = 850;
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 600, 850);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 100);
        ctx.fillStyle = 'white'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(strings.reportTitle, 300, 60);
        let y = 180;
        Object.entries(state.results).forEach(([t, d]) => {
            const p = d.count === 20 ? d.total : Math.round((d.total / (d.count * 5)) * 100);
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(strings.traits[t], 50, y);
            ctx.fillStyle = '#eee'; ctx.fillRect(200, y - 15, 350, 20);
            ctx.fillStyle = '#3498db'; ctx.fillRect(200, y - 15, 3.5 * p, 20);
            y += 80;
        });
        if (qrImg && qrImg.complete) ctx.drawImage(qrImg, 225, 650, 150, 150);
        const link = document.createElement('a'); link.download = `GIPPP_${state.lang}.png`; link.href = canvas.toDataURL(); link.click();
    };

    return { init, changeLanguage, generateImage };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
