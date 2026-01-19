const GIPPP_ENGINE = (() => {
    let state = { 
        testId: null, lang: 'ko', currentIndex: 0, answers: [], 
        questions: [], descriptions: {}, traitNames: {}, ui: {}, guide: {}, results: null 
    };

    const i18n = {
       ar: { desc: "الطريقة الأكثر حساسية لقراءتك", security: "", processing: "جاري التحليل...", wait: "يرجى الانتظار...", saveImg: "حفظ الصورة", retest: "إعادة", reportTitle: "تقرير البصيرة", recommendTitle: "💡 مقترح لك", viewAmazon: "عرض على أمازون", qrNote: "امسح للحفظ", viralTitle: "هل أنت فضولي؟", viralSub: "امسح للبدء", labels: ["أرفض بشدة", "أرفض", "محايد", "أوافق", "أوافق بشدة"], tests: { ocean: "تحليل الشخصية", loc: "عقلية النجاح", dark: "البحث عن الشرير", trust: "مقياس العلاقات", resilience: "اختبار المرونة" } },
        de: { desc: "Der sensibelste Weg, dich zu verstehen", security: "", processing: "Analyse...", wait: "Bitte warten...", saveImg: "Bild speichern", retest: "Neu starten", reportTitle: "Insight-Bericht", recommendTitle: "💡 Empfohlen", viewAmazon: "Auf Amazon", qrNote: "QR scannen", viralTitle: "Neugierig?", viralSub: "QR scannen", labels: ["Stimme gar nicht zu", "Stimme nicht zu", "Neutral", "Stimme zu", "Stimme voll zu"], tests: { ocean: "Big Five", loc: "Erfolgs-Mindset", dark: "Bösewicht-Finder", trust: "Soziales Vertrauen", resilience: "Resilienz-Test" } },
        en: { desc: "The most sensible way to read you", security: "", processing: "Analyzing...", wait: "Please wait...", saveImg: "📸 Save Image", retest: "Retest", reportTitle: "Insight Report", recommendTitle: "💡 Recommended", viewAmazon: "View on Amazon", qrNote: "Scan to save", viralTitle: "Curious about your insight?", viralSub: "Scan QR to start", labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"], tests: { ocean: "Big Five", loc: "Success Mindset", dark: "Villain Finder", trust: "Social Trust", resilience: "Resilience Test" } },
        es: { desc: "La forma más sensible de leerte", security: "", processing: "Analizando...", wait: "Espere...", saveImg: "Guardar Imagen", retest: "Reiniciar", reportTitle: "Informe", recommendTitle: "💡 Recomendado", viewAmazon: "Ver en Amazon", qrNote: "Escanea", viralTitle: "¿Curioso?", viralSub: "Escanea el QR", labels: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"], tests: { ocean: "Personalidad Big Five", loc: "Mentalidad de Éxito", dark: "Buscador de Villanos", trust: "Confianza Social", resilience: "Test de Resiliencia" } },
        ja: { desc: "あなたを読み解く最も感性的な方法", security: "", processing: "分析中...", wait: "お待ちください...", saveImg: "画像を保存", retest: "再試行", reportTitle: "レポート", recommendTitle: "💡 おすすめ", viewAmazon: "Amazonで見る", qrNote: "スキャンして保存", viralTitle: "気になりますか？", viralSub: "QRで開始", labels: ["全くそう思わない", "そう思わない", "どちらともいえない", "そう思う", "強く思う"], tests: { ocean: "本性分析", loc: "成功マインド", dark: "隠れたヴィラン", trust: "人間関係温度計", resilience: "メンタル診断" } },
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", security: "", processing: "분석 중...", wait: "잠시만 기다려 주세요.", saveImg: "📸 이미지 저장", retest: "다시 하기", reportTitle: "인사이트 리포트", recommendTitle: "💡 맞춤 추천", viewAmazon: "아마존 보기", qrNote: "스캔하여 결과 소장", viralTitle: "당신의 인사이트가 궁금하다면?", viralSub: "QR코드를 스캔하여 테스트 시작", labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"], tests: { ocean: "나의 본캐 분석", loc: "성공 마인드셋", dark: "내 안의 빌런 찾기", trust: "인간관계 온도계", resilience: "강철 멘탈 테스트" } },
        pt: { desc: "A forma mais sensata de te ler", security: "", processing: "Analisando...", wait: "Aguarde...", saveImg: "Salvar Imagem", retest: "Reiniciar", reportTitle: "Relatório", recommendTitle: "💡 Recomendado", viewAmazon: "Ver na Amazon", qrNote: "Escaneie", viralTitle: "Curioso?", viralSub: "Escaneie o QR", labels: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"], tests: { ocean: "Big Five", loc: "Mentalidad de Sucesso", dark: "Buscador de Vilões", trust: "Confiança Social", resilience: "Teste de Resiliência" } },
        ru: { desc: "Самый разумный способ понять себя", security: "", processing: "Анализ...", wait: "Подождите...", saveImg: "Сохранить", retest: "Заново", reportTitle: "Отчет", recommendTitle: "💡 Рекомендовано", viewAmazon: "На Amazon", qrNote: "Сканируйте", viralTitle: "Интересно?", viralSub: "Сканируйте QR", labels: ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"], tests: { ocean: "Большая пятерка", loc: "Локус контроля", dark: "Темная триада", trust: "Социальное доверие", resilience: "Жизнестойкость" } },
        vi: { desc: "Cách nhạy bén nhất để hiểu bạn", security: "", processing: "Đang phân tích...", wait: "Chờ chút...", saveImg: "Lưu ảnh", retest: "Làm lại", reportTitle: "Báo cáo", recommendTitle: "💡 Gợi ý", viewAmazon: "Xem trên Amazon", qrNote: "Quét để lưu", viralTitle: "Bạn tò mò?", viralSub: "Quét QR để bắt đầu", labels: ["Rất không đồng ý", "Không đồng ý", "Bình thường", "Đồng ý", "Rất đồng ý"], tests: { ocean: "Tính cách Big Five", loc: "Kiểm soát tâm thế", dark: "Bộ ba đen tối", trust: "Lòng tin xã hội", resilience: "Khả năng phục hồi" } },
        zh: { desc: "解读你最感性的方式", security: "", processing: "分析中...", wait: "请稍等...", saveImg: "保存图片", retest: "重测", reportTitle: "报告", recommendTitle: "💡 推荐", viewAmazon: "亚马逊", qrNote: "扫描保存", viralTitle: "想了解吗？", viralSub: "扫码开始", labels: ["极不同意", "不同意", "中立", "同意", "极同意"], tests: { ocean: "大五人格测试", loc: "控制点测试", dark: "黑暗人格三联征", trust: "社会信任度", resilience: "心理韧性测试" } }
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
