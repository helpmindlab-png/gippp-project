const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'en', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const testList = [
        { id: 'ocean', emoji: '🧬', tag: 'BEST', color: 'premium' },
        { id: 'dark', emoji: '🎭', tag: 'HOT', color: 'dark-mode' },
        { id: 'loc', emoji: '💰', tag: 'NEW', color: '' },
        { id: 'resilience', emoji: '🛡️', tag: '', color: '' },
        { id: 'trust', emoji: '🤝', tag: '', color: '' }
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
        securityNote: document.getElementById('security-note'),
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
            renderGuide(); // [v5.5] 바로 시작하지 않고 가이드 화면 노출
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
            state.guide = d.guide || {}; // 가이드 데이터 로드
            state.questions = d.items || [];
            state.descriptions = d.descriptions || {};
            state.traitNames = d.traitNames || {};
            
            ui.brandDesc.innerText = state.ui.desc;
            ui.securityNote.innerText = state.ui.security;
        } catch (e) { console.error("Data Load Error"); }
    };

    const renderWelcome = () => {
        ui.welcomeView.style.display = 'block';
        ui.header.style.display = 'block';
        ui.testView.style.display = 'none';
        ui.testGrid.innerHTML = testList.map(t => `
            <div class="test-card ${t.color}" onclick="GIPPP_ENGINE.changeTest('${t.id}')">
                ${t.tag ? `<div class="card-tag">${t.tag}</div>` : ''}
                <span class="emoji">${t.emoji}</span>
                <h3>${state.ui.testNames[t.id] || t.id.toUpperCase()}</h3>
                <p>${t.id.toUpperCase()} Profiling</p>
            </div>
        `).join('');
    };

    // [v5.5] 전문가 가이드 화면 렌더링
    const renderGuide = () => {
        ui.welcomeView.style.display = 'none';
        ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        
        ui.questionContainer.innerHTML = `
            <div class="guide-container">
                <div class="ipip-badge">${state.guide.ipipId || 'IPIP-STANDARD'}</div>
                <h2 class="guide-title">${state.ui.testNames[state.testId]}</h2>
                <p class="guide-purpose">${state.guide.purpose}</p>
                <div class="guide-box">
                    <p>${state.guide.instruction}</p>
                    <p class="guide-interpretation"><strong>해석 가이드:</strong> ${state.guide.interpretation}</p>
                </div>
                <button class="btn-main" onclick="GIPPP_ENGINE.startTest()">${state.guide.startBtn || 'Start Analysis'}</button>
            </div>
        `;
        ui.optionsGroup.innerHTML = '';
    };

    const startTest = () => {
        ui.welcomeView.style.display = 'none';
        ui.testView.style.display = 'block';
        renderQuestion();
    };

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
        ui.questionContainer.innerHTML = `<div class="processing-box"><div class="spinner"></div><h3>${state.ui.processing}</h3></div>`;
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
        let reportHtml = `<div class="result-card"><h2>${state.ui.reportTitle}</h2>`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            reportHtml += `
                <div class="trait-row">
                    <div class="trait-info"><strong>${state.traitNames[trait]}</strong> <span>${p}%</span></div>
                    <div class="bar-bg"><div class="bar-fill" style="width:${p}%"></div></div>
                    <p class="trait-desc">${p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low}</p>
                </div>`;
        }

        const amazonLink = `https://www.amazon.com/s?k=${state.ui.amazonKeywords[maxTrait] || 'psychology'}&tag=YOUR_TAG`;

        reportHtml += `
            <div class="recommend-box">
                <h4>${state.ui.recommendTitle}</h4>
                <a href="${amazonLink}" target="_blank" class="amazon-btn">${state.ui.viewAmazon}</a>
            </div>
            <div class="qr-section"><img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous"><p>${state.ui.qrNote}</p></div>
            <button class="btn-main" onclick="GIPPP_ENGINE.generateImage()">${state.ui.saveImg}</button>
            <button class="btn-sub" onclick="GIPPP_ENGINE.cleanExit()">${state.ui.retest}</button>
            <canvas id="resultCanvas" style="display:none;"></canvas>
        </div>`;
        
        ui.testView.innerHTML = reportHtml;
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const qrImg = document.getElementById('qrImage');
        const isRTL = (state.lang === 'ar');
        const traits = Object.entries(state.results);
        
        canvas.width = 600; canvas.height = 850;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 600, 850);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 600, 160);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(600, 160); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(state.ui.reportTitle.toUpperCase(), 300, 75);
        const sessionID = Math.random().toString(36).substring(2, 10).toUpperCase();
        ctx.fillStyle = '#38bdf8'; ctx.font = '14px monospace';
        ctx.fillText(`PROFILER ID: ${sessionID} // SECURE_SESSION_ACTIVE`, 300, 115);

        let y = 240;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            const name = state.traitNames[t] || t;
            ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 22px sans-serif';
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(name, 540, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 60, y);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(name, 60, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y);
            }
            ctx.fillStyle = '#334155'; ctx.fillRect(60, y + 15, 480, 12);
            const grad = ctx.createLinearGradient(60, 0, 540, 0);
            grad.addColorStop(0, '#0ea5e9'); grad.addColorStop(1, '#38bdf8');
            ctx.fillStyle = grad;
            if (isRTL) ctx.fillRect(540 - (480 * p / 100), y + 15, (480 * p) / 100, 12);
            else ctx.fillRect(60, y + 15, (480 * p) / 100, 12);
            y += 95;
        });

        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 650, 600, 200);
        if (qrImg && qrImg.complete) {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(50, 680, 140, 140);
            ctx.drawImage(qrImg, 60, 690, 120, 120);
        }
        ctx.textAlign = isRTL ? 'right' : 'left';
        const tx = isRTL ? 540 : 220;
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif';
        ctx.fillText(state.ui.viralTitle, tx, 720);
        ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif';
        ctx.fillText(state.ui.viralSub, tx, 755);
        ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 18px sans-serif';
        ctx.fillText('ANONYMOUS-INSIGHT.IO', tx, 790);

        const link = document.createElement('a');
        link.download = `GIPPP_PROFILING_${sessionID}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const decodeAndShowResult = (c) => {
        const s = {}; const m = c.match(/([A-Z])(\d+)/g);
        if (m) m.forEach(x => { s[x[0]] = { total: parseInt(x.substring(1)), count: 20 }; });
        state.results = s; renderFinalReport();
    };

    const cleanExit = () => { window.location.href = window.location.pathname; };
    const changeLanguage = (l) => { const u = new URL(window.location.href); u.searchParams.set('lang', l); window.location.href = u.toString(); };
    const changeTest = (t) => { const u = new URL(window.location.href); u.searchParams.set('test', t); window.location.href = u.toString(); };

    return { init, changeLanguage, changeTest, cleanExit, generateImage, startTest };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
