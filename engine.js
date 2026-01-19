const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, 
        lang: 'ko', 
        currentIndex: 0, 
        answers: [], 
        questions: [], 
        descriptions: {}, 
        traitNames: {}, 
        ui: {}, 
        guide: {}, 
        results: null 
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

    const getUI = () => ({
        welcomeView: document.getElementById('welcome-view'),
        testView: document.getElementById('test-view'),
        testGrid: document.getElementById('test-grid'),
        questionContainer: document.getElementById('question-container'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        langSelect: document.getElementById('lang-select'),
        brandDesc: document.getElementById('brand-desc'),
        midAd: document.getElementById('mid-ad')
    });

    const init = () => {
        const ui = getUI();

        if (!ui.testGrid || !ui.welcomeView || !ui.testView) {
            console.error("필수 DOM 요소 누락");
            if (ui.testGrid) {
                ui.testGrid.innerHTML = "<p style='color:red; text-align:center; padding:40px;'>페이지 로드 오류입니다.<br>새로고침(F5) 또는 브라우저 캐시 지우기를 시도해 주세요.</p>";
            }
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        state.testId = urlParams.get('test');
        state.lang = urlParams.get('lang') || navigator.language.substring(0, 2);
        if (!Object.keys(i18n).includes(state.lang)) state.lang = 'ko';

        ui.langSelect.innerHTML = Object.keys(i18n).map(l => 
            `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`
        ).join('');

        ui.langSelect.onchange = (e) => changeLanguage(e.target.value);

        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        ui.brandDesc.innerText = i18n[state.lang].desc;

        const resData = urlParams.get('res');
        if (resData) {
            decodeAndShowResult(resData);
        } else if (state.testId) {
            loadData().then(() => {
                if (state.guide && state.guide.purpose) {
                    renderGuide();
                } else {
                    startTest();
                }
            });
        } else {
            renderWelcome();
        }

        // GA4 초기화 예시 (동의 후에만 실행)
        // if (window.gtag) {
        //     gtag('event', 'page_view', { page_path: window.location.pathname });
        // }
    };

    const loadData = async () => {
        const ui = getUI();
        try {
            const targetTest = state.testId || 'ocean';
            const r = await fetch(`data/${targetTest}/${state.lang}.json`);
            if (!r.ok) throw new Error("JSON 파일 없음");
            const d = await r.json();
            state.ui = d.ui || {};
            state.guide = d.guide || {};
            state.questions = d.items || [];
            state.descriptions = d.descriptions || {};
            state.traitNames = d.traitNames || {};
        } catch (e) {
            console.error("Data Load Error:", e);
            ui.questionContainer.innerHTML = "<h3>데이터 로드 오류</h3><p>JSON 파일을 확인해주세요.</p>";
        }
    };

    const renderWelcome = () => {
        const ui = getUI();
        ui.welcomeView.style.display = 'block';
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

    // 아래는 기존 핵심 기능들 (복사해서 그대로 사용하세요)
    // renderGuide, startTest, renderQuestion, showProcessing, calculateAndRender, renderFinalReport 등
    // (공간상 생략했으나, 이전 코드에서 그대로 가져오시면 됩니다)

    const changeLanguage = (l) => {
        const u = new URL(window.location);
        u.searchParams.set('lang', l);
        window.location = u;
    };

    const changeTest = (t) => {
        const u = new URL(window.location);
        u.searchParams.set('test', t);
        u.searchParams.delete('res');
        window.location = u;
    };

    // DOM 완전 로드 후 실행
    window.addEventListener('load', init);

    return { changeLanguage, changeTest };
})();
