const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'ko', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const i18n = {
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", tests: { ocean: "나의 본캐 분석", dark: "내 안의 빌런 찾기", loc: "성공 마인드셋", resilience: "강철 멘탈 테스트", trust: "인간관계 온도계" }, sub: "Professional Analysis" },
        en: { desc: "The most sensible way to read you", tests: { ocean: "True Self (Big 5)", dark: "Villain Finder", loc: "Success Mindset", resilience: "Resilience Test", trust: "Social Trust" }, sub: "Professional Analysis" },
        // ... (다른 8개 언어는 기존 그대로 유지하세요. 공간 절약으로 생략)
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
        // header가 필요하면 추가
    });

    const init = () => {
        const ui = getUI();
        if (!ui.testGrid || !ui.welcomeView || !ui.testView) {
            console.error("필수 DOM 요소 누락");
            if (ui.testGrid) ui.testGrid.innerHTML = "<p style='color:red; text-align:center;'>페이지 로드 오류입니다. 새로고침(F5) 해주세요.</p>";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        state.testId = urlParams.get('test');
        state.lang = urlParams.get('lang') || navigator.language.substring(0, 2);
        if (!Object.keys(i18n).includes(state.lang)) state.lang = 'ko';

        ui.langSelect.innerHTML = Object.keys(i18n).map(l => 
            `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`
        ).join('');
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';

        ui.langSelect.onchange = (e) => changeLanguage(e.target.value);

        ui.brandDesc.innerText = i18n[state.lang].desc;

        const resData = urlParams.get('res');
        if (resData) {
            decodeAndShowResult(resData);
        } else if (state.testId) {
            loadData().then(() => {
                if (state.guide && state.guide.purpose) renderGuide();
                else startTest();
            });
        } else {
            renderWelcome();
        }

        // GA4 이벤트 예시 위치 (동의 후에만 실행되도록)
        // window.gtag?.('event', 'page_view', { 'page_title': 'Main Page' });
    };

    const loadData = async () => {
        const ui = getUI();
        try {
            const target = state.testId || 'ocean';
            const res = await fetch(`/data/${target}/${state.lang}.json`);
            if (!res.ok) throw new Error("JSON 로드 실패");
            const data = await res.json();
            state.ui = data.ui || {};
            state.guide = data.guide || {};
            state.questions = data.items || [];
            state.descriptions = data.descriptions || {};
            state.traitNames = data.traitNames || {};
        } catch (err) {
            console.error("Data Load Error:", err);
            ui.questionContainer.innerHTML = "<h3>데이터 로드 오류</h3><p>JSON 파일을 확인해주세요.</p>";
        }
    };

    const renderWelcome = () => {
        const ui = getUI();
        ui.welcomeView.style.display = 'block';
        ui.testView.style.display = 'none';

        const current = i18n[state.lang];
        ui.testGrid.innerHTML = testList.map(t => `
            <div class="test-card" onclick="GIPPP_ENGINE.changeTest('${t.id}')">
                <span class="emoji">${t.emoji}</span>
                <h3>${current.tests[t.id] || t.id.toUpperCase()}</h3>
                <p>${current.sub}</p>
            </div>
        `).join('');
    };

    // 나머지 기존 핵심 기능들 (renderGuide, startTest, renderQuestion, showProcessing, calculateAndRender, renderFinalReport, decodeAndShowResult, generateImage, cleanExit 등)은 
    // 기존 코드 그대로 복사해서 붙여넣으시면 됩니다. 
    // (공간 절약을 위해 여기서는 생략했지만, 질문/답변 처리, 결과 계산, 이미지 생성, URL 복원 등 모든 로직이 그대로 살아 있어야 합니다)

    const changeLanguage = (l) => {
        const url = new URL(window.location);
        url.searchParams.set('lang', l);
        window.location = url;
    };

    const changeTest = (t) => {
        const url = new URL(window.location);
        url.searchParams.set('test', t);
        url.searchParams.delete('res');
        window.location = url;
    };

    // DOM 완전 로드 후 초기화 (null 에러 방지 핵심)
    window.addEventListener('load', init);

    return { changeLanguage, changeTest };
})();
