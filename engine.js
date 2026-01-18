const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'en', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const i18n = {
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", tests: { ocean: "나의 본캐 분석", dark: "내 안의 빌런 찾기", loc: "성공 마인드셋", resilience: "강철 멘탈 테스트", trust: "인간관계 온도계" }, sub: "Professional Analysis" },
        en: { desc: "The most sensible way to read you", tests: { ocean: "True Self (Big 5)", dark: "Villain Finder", loc: "Success Mindset", resilience: "Resilience Test", trust: "Social Trust" }, sub: "Professional Analysis" },
        ja: { desc: "あなたを読み解く最も感性的な方法", tests: { ocean: "本性分析", dark: "隠れたヴィラン", loc: "成功マインド", resilience: "メンタル診断", trust: "人間関係" }, sub: "Professional Analysis" },
        zh: { desc: "解读你最感性的方式", tests: { ocean: "大五人格", dark: "黑暗人格", loc: "成功心态", resilience: "心理韧性", trust: "人际关系" }, sub: "Professional Analysis" },
        es: { desc: "La forma más sensible de leerte", tests: { ocean: "Personalidad", dark: "Villano Interior", loc: "Mentalidad", resilience: "Resiliencia", trust: "Confianza" }, sub: "Professional Analysis" },
        ar: { desc: "الطريقة الأكثر حساسية لقراءتك", tests: { ocean: "تحليل الشخصية", dark: "البحث عن الشرير", loc: "عقلية النجاح", resilience: "اختبار المرونة", trust: "مقياس العلاقات" }, sub: "Professional Analysis" },
        de: { desc: "Der sensibelste Weg, dich zu verstehen", tests: { ocean: "Big Five", dark: "Bösewicht-Finder", loc: "Erfolgs-Mindset", resilience: "Resilienz-Test", trust: "Vertrauen" }, sub: "Professional Analysis" },
        pt: { desc: "A forma mais sensata de te ler", tests: { ocean: "Personalidade", dark: "Buscador de Vilões", loc: "Mentalidade", resilience: "Resiliência", trust: "Confiança" }, sub: "Professional Analysis" },
        ru: { desc: "Самый разумный способ понять себя", tests: { ocean: "Личность", dark: "Поиск злодея", loc: "Успех", resilience: "Стойкость", trust: "Доверие" }, sub: "Professional Analysis" },
        vi: { desc: "Cách nhạy bén nhất để hiểu bạn", tests: { ocean: "Tính cách", dark: "Tìm phản diện", loc: "Thành công", resilience: "Bản lĩnh", trust: "Tin tưởng" }, sub: "Professional Analysis" }
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
        
        const langs = Object.keys(i18n);
        if (!langs.includes(state.lang)) state.lang = 'en';

        ui.langSelect.innerHTML = langs.map(l => `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('');
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';

        const currentI18n = i18n[state.lang];
        ui.brandDesc.innerText = currentI18n.desc;

        const resData = urlParams.get('res');
        if (resData) {
            await loadData();
            decodeAndShowResult(resData);
        } else if (state.testId) {
            await loadData();
            // [수정] 가이드 데이터가 있으면 가이드 노출, 없으면 즉시 설문 시작
            if (state.guide && state.guide.purpose) {
                renderGuide();
            } else {
                startTest();
            }
        } else {
            renderWelcome();
        }
    };

    const loadData = async () => {
        try {
            const targetTest = state.testId || 'ocean';
            const r = await fetch(`./data/${targetTest}/${state.lang}.json`);
            if (!r.ok) throw new Error("JSON missing");
            const d = await r.json();
            state.ui = d.ui || {};
            state.guide = d.guide || {};
            state.questions = d.items || [];
            state.descriptions = d.descriptions || {};
            state.traitNames = d.traitNames || {};
        } catch (e) { 
            console.error("Data Load Error:", e);
            ui.questionContainer.innerHTML = "<h3>Data Load Error</h3><p>Please check if the JSON file exists in /data/ folder.</p>";
        }
    };

    const renderWelcome = () => {
        ui.welcomeView.style.display = 'block';
        ui.header.style.display = 'block';
        ui.testView.style.display = 'none';
        const currentI18n = i18n[state.lang];
        ui.testGrid.innerHTML = testList.map(t => `
            <div class="test-card" onclick="GIPPP_ENGINE.changeTest('${t.id}')">
                <span class="emoji">${t.emoji}</span>
                <h3>${currentI18n.tests[t.id] || t.id.toUpperCase()}</h3>
                <p>${currentI18n.sub}</p>
            </div>
        `).join('');
    };

    const renderGuide = () => {
        ui.welcomeView.style.display = 'none';
        ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        ui.questionContainer.innerHTML = `
            <div class="guide-content" style="padding:20px; text-align:center;">
                <h2 style="font-size:1.8rem; margin-bottom:10px;">${i18n[state.lang].tests[state.testId]}</h2>
                <p style="color:#666; margin-bottom:25px;">${state.guide.purpose || ''}</p>
                <div style="background:#f0f7ff; padding:25px; border-radius:20px; text-align:left; margin-bottom:25px;">
                    <p style="font-size:0.95rem;">✨ ${state.guide.instruction || ''}</p>
                    <p style="font-size:0.85rem; color:#888; border-top:1px solid #d0e0f0; margin-top:15px; padding-top:15px;">💡 ${state.guide.interpretation || ''}</p>
                </div>
                <button class="btn-main" style="width:100%; margin:0;" onclick="GIPPP_ENGINE.startTest()">${state.guide.startBtn || 'Start'}</button>
            </div>
        `;
        ui.optionsGroup.innerHTML = '';
    };

    const startTest = () => {
        ui.welcomeView.style.display = 'none';
        ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        renderQuestion();
    };

    const renderQuestion = () => {
        if (!state.questions || state.questions.length === 0) {
            ui.questionContainer.innerHTML = "<h3>No Questions Found</h3>";
            return;
        }
        const q = state.questions[state.currentIndex];
        ui.questionContainer.innerHTML = `<div class="q-text">${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';
        const labels = state.ui.labels || ["-", "-", "-", "-", "-"];
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = labels[score - 1];
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
        ui.questionContainer.innerHTML = `<div style="padding:40px 0;"><div class="spinner"></div><h3>${state.ui.processing || 'Analyzing...'}</h3></div>`;
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
        let reportHtml = `<div class="result-card"><div class="result-header"><h2>${state.ui.reportTitle || 'Result'}</h2></div><div class="result-body">`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            const traitName = state.traitNames[trait] || trait;
            const desc = state.descriptions[trait] ? (p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low) : "";
            reportHtml += `<div class="trait-row"><div class="trait-label"><span>${traitName}</span> <span>${p}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${p}%"></div></div><p style="font-size:0.85rem; color:#666; margin-top:8px;">${desc}</p></div>`;
        }

        reportHtml += `<div class="recommend-box"><h4>${state.ui.recommendTitle || 'Recommend'}</h4><a href="https://www.amazon.com/s?k=${state.ui.amazonKeywords ? state.ui.amazonKeywords[maxTrait] : 'psychology'}" target="_blank" class="amazon-btn">${state.ui.viewAmazon || 'View'}</a></div><div class="qr-section"><img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous"><p style="font-size:0.8rem; color:#999; margin-top:10px;">${state.ui.qrNote || ''}</p></div></div><button class="btn-main" onclick="GIPPP_ENGINE.generateImage()">${state.ui.saveImg || 'Save'}</button><button class="btn-sub" onclick="GIPPP_ENGINE.cleanExit()">${state.ui.retest || 'Retest'}</button></div><canvas id="resultCanvas" style="display:none;"></canvas>`;
        
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
        ctx.fillText(state.ui.reportTitle || 'Result', 300, 75);
        let y = 220;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 26px sans-serif';
            const name = state.traitNames[t] || t;
            if (isRTL) { ctx.textAlign = 'right'; ctx.fillText(name, 530, y); ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 70, y); }
            else { ctx.textAlign = 'left'; ctx.fillText(name, 70, y); ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 530, y); }
            ctx.fillStyle = '#f0f0f0'; ctx.fillRect(70, y + 15, 460, 18);
            ctx.fillStyle = '#3498db';
            if (isRTL) ctx.fillRect(530 - (460 * p / 100), y + 15, (460 * p) / 100, 18);
            else ctx.fillRect(70, y + 15, (460 * p) / 100, 18);
            y += 110;
        });
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 700, 600, 200);
        if (qrImg && qrImg.complete) { ctx.fillStyle = '#ffffff'; ctx.fillRect(50, 725, 150, 150); ctx.drawImage(qrImg, 60, 735, 130, 130); }
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = isRTL ? 'right' : 'left';
        const tx = isRTL ? 540 : 220;
        ctx.fillText(state.ui.viralTitle || '', tx, 780);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '18px sans-serif';
        ctx.fillText(state.ui.viralSub || '', tx, 815);
        ctx.fillStyle = '#3498db'; ctx.font = 'bold 16px sans-serif'; ctx.fillText('gippp.github.io', tx, 845);
        const link = document.createElement('a'); link.download = `GIPPP_Result.png`; link.href = canvas.toDataURL('image/png'); link.click();
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
