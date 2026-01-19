const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'ko', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const i18n = {
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", tests: { ocean: "나의 본캐 분석", dark: "내 안의 빌런 찾기", loc: "성공 마인드셋", resilience: "강철 멘탈 테스트", trust: "인간관계 온도계" }, sub: "Professional Analysis" },
        // 다른 언어는 기존 그대로 (생략)
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
            if (ui.testGrid) ui.testGrid.innerHTML = "<p style='color:red;text-align:center;padding:40px;'>페이지 로드 오류입니다. 새로고침(F5) 해주세요.</p>";
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
                    renderGuide();  // 이제 여기서 정상 호출됨
                } else {
                    startTest();
                }
            }).catch(err => {
                console.error("loadData Promise Error:", err);
                ui.questionContainer.innerHTML = "<h3>검사 로드 중 오류</h3><p>새로고침 해주세요.</p>";
            });
        } else {
            renderWelcome();
        }
    };

    const loadData = async () => {
        const ui = getUI();
        try {
            const targetTest = state.testId || 'ocean';
            const r = await fetch(`data/${targetTest}/${state.lang}.json`);
            if (!r.ok) throw new Error("JSON 파일 로드 실패");
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

    // ★★★ 핵심 추가: renderGuide 함수 (이게 없어서 에러 발생)
    const renderGuide = () => {
        const ui = getUI();
        ui.welcomeView.style.display = 'none';
        ui.testView.style.display = 'block';

        ui.questionContainer.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2 style="font-size: 2rem; margin-bottom: 20px;">${state.ui.testNames?.[state.testId] || i18n[state.lang].tests[state.testId]}</h2>
                <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">${state.guide.purpose || '이 검사는 당신의 숨겨진 성향을 분석합니다.'}</p>
                <div style="background: #f0f7ff; padding: 30px; border-radius: 20px; text-align: left; margin-bottom: 30px;">
                    <p style="font-size: 1rem; line-height: 1.6;">✨ ${state.guide.instruction || '문항을 솔직하게 선택해주세요.'}</p>
                    <p style="font-size: 0.9rem; color: #555; margin-top: 20px; border-top: 1px solid #d0e0f0; padding-top: 20px;">💡 ${state.guide.interpretation || '결과는 참고용이며, 엔터테인먼트 목적입니다.'}</p>
                </div>
                <button class="btn-main" style="width: 100%; padding: 15px; font-size: 1.1rem;" onclick="GIPPP_ENGINE.startTest()">분석 시작하기</button>
            </div>
        `;
        ui.optionsGroup.innerHTML = ''; // 옵션 그룹 초기화
    };

    // startTest 함수 (기존 로직 유지 예시, 필요 시 확장)
    const startTest = () => {
        const ui = getUI();
        ui.questionContainer.innerHTML = '<p>질문 로딩 중...</p>';
        // 여기서 renderQuestion() 등 기존 질문 렌더링 로직 시작
        // (기존 코드에 있던 질문 렌더링 부분을 붙여넣으시면 됩니다)
    };

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

    // 결과 복원 등 나머지 함수들 (기존 코드 그대로 유지)
    // 예: decodeAndShowResult, renderFinalReport, generateImage 등

    window.addEventListener('load', init);

    return { changeLanguage, changeTest, startTest };
})();
