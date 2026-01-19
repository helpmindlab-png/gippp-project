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

    // ui 객체를 함수 안에서 동적으로 가져오게 변경 (null 방지)
    const getUI = () => ({
        welcomeView: document.getElementById('welcome-view'),
        testView: document.getElementById('test-view'),
        testGrid: document.getElementById('test-grid'),
        questionContainer: document.getElementById('question-container'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        langSelect: document.getElementById('lang-select'),
        brandDesc: document.getElementById('brand-desc'),
        midAd: document.getElementById('mid-ad'),
        header: document.getElementById('main-header')  // 만약 이 ID가 없다면 null 체크 필요
    });

    const init = async () => {
        try {
            console.log("Initializing GIPPP_ENGINE...");
            const urlParams = new URLSearchParams(window.location.search);
            state.testId = urlParams.get('test');
            state.lang = urlParams.get('lang') || navigator.language.substring(0, 2);
            
            const langs = Object.keys(i18n);
            if (!langs.includes(state.lang)) state.lang = 'en';

            const ui = getUI();  // 여기서 다시 가져옴

            ui.langSelect.innerHTML = langs.map(l => `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('');
            document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';

            const currentI18n = i18n[state.lang];
            console.log("Selected Language:", state.lang, "i18n Data:", currentI18n);
            ui.brandDesc.innerText = currentI18n.desc;

            const resData = urlParams.get('res');
            if (resData) {
                await loadData();
                decodeAndShowResult(resData);
            } else if (state.testId) {
                await loadData();
                if (state.guide && state.guide.purpose) {
                    renderGuide(ui);
                } else {
                    startTest(ui);
                }
            } else {
                renderWelcome(ui);
            }
        } catch (e) {
            console.error("Init Error:", e);
            const ui = getUI();
            if (ui.testGrid) ui.testGrid.innerHTML = "<p>오류 발생: 페이지를 새로고침해 주세요. (콘솔 확인 필요)</p>";
        }
    };

    const loadData = async () => {
        // 기존 loadData 그대로 유지 (생략)
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
            const ui = getUI();
            if (ui.questionContainer) ui.questionContainer.innerHTML = "<h3>Data Load Error</h3><p>Please check if the JSON file exists in /data/ folder.</p>";
        }
    };

    const renderWelcome = (ui) => {
        console.log("Rendering Welcome...");
        if (!ui.welcomeView || !ui.testView || !ui.testGrid) {
            console.error("DOM elements missing in renderWelcome:", { welcomeView: ui.welcomeView, testView: ui.testView, testGrid: ui.testGrid });
            return;
        }
        ui.welcomeView.style.display = 'block';
        if (ui.header) ui.header.style.display = 'block';
        ui.testView.style.display = 'none';
        const currentI18n = i18n[state.lang];
        const gridHtml = testList.map(t => `
            <div class="test-card" onclick="GIPPP_ENGINE.changeTest('${t.id}')">
                <span class="emoji">${t.emoji}</span>
                <h3>${currentI18n.tests[t.id] || t.id.toUpperCase()}</h3>
                <p>${currentI18n.sub}</p>
            </div>
        `).join('');
        console.log("Generated Test Grid HTML:", gridHtml);
        ui.testGrid.innerHTML = gridHtml;
    };

    // 나머지 함수들 (renderGuide, startTest 등)도 ui 파라미터 받도록 수정
    const renderGuide = (ui) => {
        if (!ui) ui = getUI();
        ui.welcomeView.style.display = 'none';
        if (ui.header) ui.header.style.display = 'none';
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

    const startTest = (ui) => {
        if (!ui) ui = getUI();
        ui.welcomeView.style.display = 'none';
        if (ui.header) ui.header.style.display = 'none';
        ui.testView.style.display = 'block';
        renderQuestion(ui);
    };

    // renderQuestion, showProcessing, calculateAndRender 등은 기존 그대로 유지 (생략, 필요 시 추가)

    // ... (calculateAndRender, renderFinalReport, decodeAndShowResult, generateImage, cleanExit, changeLanguage, changeTest 함수는 기존과 동일하게 유지하세요)

    return { init, changeLanguage, changeTest, cleanExit, generateImage, startTest };
})();

// DOM 완전 로드 후 init 호출 (타이밍 문제 해결)
window.addEventListener('load', () => {
    console.log("Window fully loaded, calling init()");
    GIPPP_ENGINE.init();
});
