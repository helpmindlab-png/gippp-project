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
        // [핵심] 결과 데이터가 URL에 있으면 즉시 복원 화면으로 이동
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
                <p>Character Analysis</p>
            </div>
        `).join('');
    };

    const renderGuide = () => {
        ui.welcomeView.style.display = 'none';
        ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        
        ui.questionContainer.innerHTML = `
            <div class="guide-container">
                <h2 class="guide-title">${state.ui.testNames[state.testId]}</h2>
                <p class="guide-purpose">${state.guide.purpose}</p>
                <div class="guide-box">
                    <p>✨ ${state.guide.instruction}</p>
                    <p>💡 ${state.guide.interpretation}</p>
                </div>
                <button class="btn-main" onclick="GIPPP_ENGINE.startTest()">${state.guide.startBtn || '시작하기'}</button>
                <p class="ipip-info">Method: ${state.guide.ipipId || 'Standard'}</p>
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
        // [핵심] 결과값을 URL 파라미터용 문자열로 변환 (예: N70M85P50)
        const resCode = Object.entries(state.results).map(([t, d]) => t + Math.round((d.total/(d.count*5))*100)).join('');
        const shareUrl = `${window.location.origin}${window.location.pathname}?test=${state.testId}&lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        
        let maxTrait = '', maxScore = -1;
        let reportHtml = `
            <div class="result-card">
                <div class="card-inner">
                    <h2>${state.ui.reportTitle}</h2>`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            reportHtml += `
                <div class="trait-row">
                    <div class="trait-label"><span>${state.traitNames[trait]}</span> <span>${p}%</span></div>
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
                    <div class="qr-section">
                        <img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous">
                        <p>${state.ui.qrNote}</p>
                    </div>
                    <button class="btn-main" onclick="GIPPP_ENGINE.generateImage()">${state.ui.saveImg}</button>
                    <button class="btn-sub" onclick="GIPPP_ENGINE.cleanExit()">${state.ui.retest}</button>
                    <p class="ipip-info" style="margin-top:20px; opacity:0.3;">Verified by ${state.guide.ipipId || 'Standard'}</p>
                </div>
            <canvas id="resultCanvas" style="display:none;"></canvas>
        </div>`;
        
        ui.testView.innerHTML = reportHtml;
        ui.testView.style.display = 'block';
    };

    // [핵심] URL 파라미터에서 결과를 추출하여 복원하는 로직
    const decodeAndShowResult = (c) => {
        const s = {}; 
        const m = c.match(/([A-Z])(\d+)/g);
        if (m) {
            m.forEach(x => { 
                const trait = x[0];
                const score = parseInt(x.substring(1));
                s[trait] = { total: score, count: 20 }; // 가중치 역산 (100점 만점 기준)
            });
        }
        state.results = s; 
        renderFinalReport();
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const qrImg = document.getElementById('qrImage');
        const isRTL = (state.lang === 'ar');
        const traits = Object.entries(state.results);
        
        canvas.width = 600; canvas.height = 900;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 600, 900);
        
        // 캐릭터 카드 배경
        ctx.fillStyle = '#e7f5ff';
        ctx.beginPath(); ctx.roundRect(20, 20, 560, 860, 40); ctx.fill();

        ctx.fillStyle = '#4dabf7'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(state.ui.reportTitle, 300, 100);
        
        let y = 200;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            const name = state.traitNames[t] || t;
            ctx.fillStyle = '#212529'; ctx.font = 'bold 24px sans-serif';
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(name, 530, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 70, y);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(name, 70, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 530, y);
            }
            ctx.fillStyle = '#f1f3f5'; ctx.fillRect(70, y + 15, 460, 15);
            ctx.fillStyle = '#4dabf7';
            if (isRTL) ctx.fillRect(530 - (460 * p / 100), y + 15, (460 * p) / 100, 15);
            else ctx.fillRect(70, y + 15, (460 * p) / 100, 15);
            y += 100;
        });

        // QR 코드 삽입 (결과 복원용 URL 포함)
        if (qrImg && qrImg.complete) {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(225, 650, 150, 150);
            ctx.drawImage(qrImg, 235, 660, 130, 130);
        }
        ctx.fillStyle = '#adb5bd'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(state.ui.viralTitle, 300, 820);
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`VERIFIED BY ${state.guide.ipipId || 'STANDARD'}`, 300, 850);
        
        const link = document.createElement('a');
        link.download = `GIPPP_Result.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const cleanExit = () => { window.location.href = window.location.pathname; };
    const changeLanguage = (l) => { const u = new URL(window.location.href); u.searchParams.set('lang', l); window.location.href = u.toString(); };
    const changeTest = (t) => { const u = new URL(window.location.href); u.searchParams.set('test', t); window.location.href = u.toString(); };

    return { init, changeLanguage, changeTest, cleanExit, generateImage, startTest };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
