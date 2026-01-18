const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'en', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const testList = [
        { id: 'ocean', emoji: '🧬' }, { id: 'dark', emoji: '🎭' },
        { id: 'loc', emoji: '💰' }, { id: 'resilience', emoji: '🛡️' }, { id: 'trust', emoji: '🤝' }
    ];

    const ui = {
        welcomeView: document.getElementById('welcome-view'),
        testView: document.getElementById('test-view'),
        testGrid: document.getElementById('test-grid'),
        questionContainer: document.getElementById('question-container'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        langSelect: document.getElementById('lang-select'),
        brandDesc: document.getElementById('brand-desc'),
        midAd: document.getElementById('mid-ad'),
        header: document.getElementById('main-header')
    };

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        state.testId = urlParams.get('test');
        state.lang = urlParams.get('lang') || navigator.language.substring(0, 2);
        
        const langs = ['ko', 'en', 'ja', 'ar', 'es', 'zh', 'de', 'pt', 'ru', 'vi'];
        if (!langs.includes(state.lang)) state.lang = 'en';

        ui.langSelect.innerHTML = langs.map(l => `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('');
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';

        await loadData();

        const resData = urlParams.get('res');
        if (resData) {
            decodeAndShowResult(resData);
        } else if (state.testId) {
            renderGuide(); 
        } else {
            renderWelcome();
        }
    };

    const loadData = async () => {
        try {
            const targetTest = state.testId || 'ocean';
            const r = await fetch(`./data/${targetTest}/${state.lang}.json`);
            const d = await r.json();
            state.ui = d.ui;
            state.guide = d.guide || {};
            state.questions = d.items || [];
            state.descriptions = d.descriptions || {};
            state.traitNames = d.traitNames || {};
            ui.brandDesc.innerText = state.ui.desc;
        } catch (e) { console.error("Data Load Error"); }
    };

    const renderWelcome = () => {
        ui.welcomeView.style.display = 'block';
        ui.header.style.display = 'block';
        ui.testView.style.display = 'none';
        ui.testGrid.innerHTML = testList.map(t => `
            <div class="test-card" onclick="GIPPP_ENGINE.changeTest('${t.id}')">
                <span class="emoji">${t.emoji}</span>
                <h3>${state.ui.testNames[t.id] || t.id.toUpperCase()}</h3>
            </div>
        `).join('');
    };

    const renderGuide = () => {
        ui.welcomeView.style.display = 'none';
        ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        ui.questionContainer.innerHTML = `
            <div class="guide-content" style="padding:20px; text-align:center;">
                <h2 style="font-size:1.8rem; margin-bottom:10px;">${state.ui.testNames[state.testId]}</h2>
                <p style="color:#666; margin-bottom:25px;">${state.guide.purpose}</p>
                <div style="background:#f0f7ff; padding:25px; border-radius:20px; text-align:left; margin-bottom:25px;">
                    <p style="font-size:0.95rem;">✨ ${state.guide.instruction}</p>
                    <p style="font-size:0.85rem; color:#888; border-top:1px solid #d0e0f0; margin-top:15px; padding-top:15px;">💡 ${state.guide.interpretation}</p>
                </div>
                <button class="btn-main" style="width:100%; margin:0;" onclick="GIPPP_ENGINE.startTest()">${state.guide.startBtn || 'Start'}</button>
            </div>
        `;
        ui.optionsGroup.innerHTML = '';
    };

    const startTest = () => { renderQuestion(); };

    const renderQuestion = () => {
        const q = state.questions[state.currentIndex];
        ui.questionContainer.innerHTML = `<div class="q-text">${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = state.ui.labels[score - 1];
            btn.onclick = () => {
                state.answers.push({ trait: q.trait, score: q.direction === "-" ? 6 - score : score });
                if (++state.currentIndex < state.questions.length) renderQuestion();
                else showProcessing();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        ui.questionContainer.innerHTML = `<div style="padding:40px 0;"><div class="spinner"></div><h3>${state.ui.processing}</h3></div>`;
        ui.optionsGroup.innerHTML = '';
        ui.midAd.style.display = 'block';
        setTimeout(calculateAndRender, 3000);
    };

    const calculateAndRender = () => {
        state.results = state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score; acc[curr.trait].count += 1;
            return acc;
        }, {});
        renderFinalReport();
    };

    const renderFinalReport = () => {
        const resCode = Object.entries(state.results).map(([t, d]) => t + Math.round((d.total/(d.count*5))*100)).join('');
        const shareUrl = `${window.location.origin}${window.location.pathname}?test=${state.testId}&lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        
        let maxTrait = '', maxScore = -1;
        let reportHtml = `
            <div class="result-card">
                <div class="result-header"><h2>${state.ui.reportTitle}</h2></div>
                <div class="result-body">`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            reportHtml += `
                <div class="trait-row">
                    <div class="trait-label"><span>${state.traitNames[trait]}</span> <span>${p}%</span></div>
                    <div class="bar-bg"><div class="bar-fill" style="width:${p}%"></div></div>
                    <p style="font-size:0.85rem; color:#666; margin-top:8px;">${p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low}</p>
                </div>`;
        }

        reportHtml += `
                    <div class="recommend-box">
                        <h4>${state.ui.recommendTitle}</h4>
                        <a href="https://www.amazon.com/s?k=${state.ui.amazonKeywords[maxTrait] || 'psychology'}" target="_blank" class="amazon-btn">${state.ui.viewAmazon}</a>
                    </div>
                    <div class="qr-section">
                        <img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous">
                        <p class="qr-note">${state.ui.qrNote}</p>
                    </div>
                </div>
                <button class="btn-main" onclick="GIPPP_ENGINE.generateImage()">${state.ui.saveImg}</button>
                <button class="btn-sub" onclick="GIPPP_ENGINE.cleanExit()">${state.ui.retest}</button>
                <p style="text-align:center; font-size:0.6rem; color:#ccc; padding-bottom:20px; opacity:0.5;">Verified by ${state.guide.ipipId || 'Standard'}</p>
            </div>
            <canvas id="resultCanvas" style="display:none;"></canvas>`;
        
        ui.testView.innerHTML = reportHtml;
        ui.testView.style.display = 'block';
        ui.midAd.style.display = 'none';
    };

    const decodeAndShowResult = (c) => {
        const s = {}; const m = c.match(/([A-Z])(\d+)/g);
        if (m) m.forEach(x => { s[x[0]] = { total: parseInt(x.substring(1)), count: 20 }; });
        state.results = s; renderFinalReport();
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const qrImg = document.getElementById('qrImage');
        const isRTL = (state.lang === 'ar');
        const traits = Object.entries(state.results);
        
        canvas.width = 600; canvas.height = 900;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 900);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 120);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(state.ui.reportTitle, 300, 75);
        
        let y = 220;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            const name = state.traitNames[t] || t;
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 26px sans-serif';
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(name, 530, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 70, y);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(name, 70, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 530, y);
            }
            ctx.fillStyle = '#f0f0f0'; ctx.fillRect(70, y + 15, 460, 18);
            ctx.fillStyle = '#3498db';
            if (isRTL) ctx.fillRect(530 - (460 * p / 100), y + 15, (460 * p) / 100, 18);
            else ctx.fillRect(70, y + 15, (460 * p) / 100, 18);
            y += 110;
        });

        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 700, 600, 200);
        if (qrImg && qrImg.complete) {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(50, 725, 150, 150);
            ctx.drawImage(qrImg, 60, 735, 130, 130);
        }
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = isRTL ? 'right' : 'left';
        const tx = isRTL ? 540 : 220;
        ctx.fillText(state.ui.viralTitle, tx, 780);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '18px sans-serif';
        ctx.fillText(state.ui.viralSub, tx, 815);
        ctx.fillStyle = '#3498db'; ctx.font = 'bold 16px sans-serif';
        ctx.fillText('gippp.github.io', tx, 845);
        
        const link = document.createElement('a');
        link.download = `GIPPP_Result.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const cleanExit = () => { 
        const url = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, url);
        window.location.href = url; 
    };

    const changeLanguage = (l) => { const u = new URL(window.location.href); u.searchParams.set('lang', l); window.location.href = u.toString(); };
    const changeTest = (t) => { const u = new URL(window.location.href); u.searchParams.set('test', t); u.searchParams.delete('res'); window.location.href = u.toString(); };

    return { init, changeLanguage, changeTest, cleanExit, generateImage, startTest };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
