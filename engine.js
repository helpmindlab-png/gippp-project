/* engine.js - GIPPP_ENGINE (전체 파일)
   목적: 검수용 안정화 버전. 기존 모듈 구조 유지.
   사용법: index.html과 동일 폴더 구조에서 동작. data/{test}/{lang}.json 파일을 로드.
*/

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

  // 기본 i18n(검수용 최소값). 실제 각 언어별 문구는 data/*.json에서 주입됩니다.
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

  const supportedLangs = ['ar','de','en','es','ja','ko','pt','ru','vi','zh'];

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

  /********************
   * 초기화
   ********************/
  const init = () => {
    const ui = getUI();
    if (!ui.testGrid || !ui.welcomeView || !ui.testView) {
      console.error("필수 DOM 요소 누락");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    state.testId = urlParams.get('test') || null;

    // 언어 우선순위: URL lang -> 브라우저 언어(앞 2자리) -> 'ko'
    let langParam = urlParams.get('lang');
    if (!langParam) {
      try { langParam = navigator.language.substring(0,2); } catch(e) { langParam = 'ko'; }
    }
    state.lang = supportedLangs.includes(langParam) ? langParam : 'ko';

    populateLangSelect();
    ui.brandDesc.textContent = (i18n[state.lang] && i18n[state.lang].desc) ? i18n[state.lang].desc : i18n['ko'].desc;
    document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';

    const resData = urlParams.get('res');
    if (resData) {
      try {
        decodeAndShowResult(resData);
      } catch (e) {
        console.error('결과 복원 실패', e);
        renderWelcome();
      }
      return;
    }

    if (state.testId) {
      loadData().then(() => {
        if (state.guide && state.guide.purpose) renderGuide();
        else startTest();
      }).catch(err => {
        console.error("loadData Error:", err);
        renderWelcome();
      });
    } else {
      renderWelcome();
    }
  };

  /********************
   * 언어 선택 드롭다운 채우기
   ********************/
  const populateLangSelect = () => {
    const ui = getUI();
    if (!ui.langSelect) return;
    ui.langSelect.innerHTML = '';
    supportedLangs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l.toUpperCase();
      if (l === state.lang) opt.selected = true;
      ui.langSelect.appendChild(opt);
    });
    ui.langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
  };

  const changeLanguage = (lang) => {
    if (!supportedLangs.includes(lang)) return;
    state.lang = lang;
    document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
    const ui = getUI();
    ui.brandDesc.textContent = (i18n[state.lang] && i18n[state.lang].desc) ? i18n[state.lang].desc : i18n['ko'].desc;
    // 현재 선택된 테스트가 있으면 새로 로드
    if (state.testId) {
      loadData().then(() => {
        renderGuide();
      }).catch(() => {
        renderWelcome();
      });
    } else renderWelcome();
  };

  /********************
   * 데이터 로드 (검수용 안정화)
   ********************/
  const loadData = async () => {
    const ui = getUI();
    const targetTest = state.testId || 'ocean';
    const path = `data/${targetTest}/${state.lang}.json`;
    try {
      const r = await fetch(path, { cache: 'no-store' });
      if (!r.ok) {
        // 폴백: 영어 파일 시도
        if (state.lang !== 'en') {
          const fallbackPath = `data/${targetTest}/en.json`;
          const rf = await fetch(fallbackPath, { cache: 'no-store' });
          if (rf.ok) {
            const d = await rf.json();
            applyData(d);
            return;
          }
        }
        throw new Error(`JSON 파일 로드 실패: ${path}`);
      }
      const d = await r.json();
      applyData(d);
    } catch (e) {
      console.error("Data Load Error:", e);
      if (ui.questionContainer) {
        ui.questionContainer.innerHTML = "<h3>데이터 로드 오류</h3><p>해당 언어파일이 없거나 JSON 문법 오류가 있습니다. 콘솔 로그를 확인하세요.</p>";
      }
      throw e;
    }
  };

  const applyData = (d) => {
    state.ui = d.ui || {};
    state.guide = d.guide || {};
    state.questions = d.items || [];
    state.descriptions = d.descriptions || {};
    state.traitNames = d.traitNames || {};
  };

  /********************
   * 환영 화면 렌더링 (이벤트 바인딩)
   ********************/
  const renderWelcome = () => {
    const ui = getUI();
    ui.welcomeView.style.display = 'block';
    ui.testView.style.display = 'none';
    ui.testGrid.innerHTML = '';

    const currentI18n = i18n[state.lang] || i18n['ko'];

    testList.forEach(t => {
      const card = document.createElement('div');
      card.className = 'test-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.dataset.testId = t.id;

      const emoji = document.createElement('span');
      emoji.className = 'emoji';
      emoji.textContent = t.emoji;
      card.appendChild(emoji);

      const h3 = document.createElement('h3');
      h3.textContent = currentI18n.tests[t.id] || t.id.toUpperCase();
      card.appendChild(h3);

      const p = document.createElement('p');
      p.textContent = currentI18n.sub || '';
      card.appendChild(p);

      card.addEventListener('click', () => changeTest(t.id));
      card.addEventListener('keypress', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); changeTest(t.id); }});

      ui.testGrid.appendChild(card);
    });
  };

  /********************
   * 가이드 렌더링
   ********************/
  const renderGuide = () => {
    const ui = getUI();
    ui.welcomeView.style.display = 'none';
    ui.testView.style.display = 'block';
    ui.questionContainer.innerHTML = '';

    const title = document.createElement('h2');
    title.style.fontSize = '2rem';
    title.style.marginBottom = '20px';
    title.textContent = state.ui.testNames?.[state.testId] || (i18n[state.lang]?.tests?.[state.testId] || state.testId);

    const purpose = document.createElement('p');
    purpose.style.color = '#666';
    purpose.style.marginBottom = '30px';
    purpose.style.lineHeight = '1.6';
    purpose.textContent = state.guide.purpose || '이 검사는 당신의 숨겨진 성향을 분석합니다.';

    const box = document.createElement('div');
    box.style.background = '#f0f7ff';
    box.style.padding = '30px';
    box.style.borderRadius = '20px';
    box.style.textAlign = 'left';
    box.style.marginBottom = '30px';
    box.textContent = state.guide.instruction || '문항을 읽고 평소 느낌에 맞게 선택하세요.';

    const startBtn = document.createElement('button');
    startBtn.className = 'opt-btn';
    startBtn.textContent = state.guide.startBtn || '분석 시작하기';
    startBtn.addEventListener('click', () => startTest());

    ui.questionContainer.appendChild(title);
    ui.questionContainer.appendChild(purpose);
    ui.questionContainer.appendChild(box);
    ui.questionContainer.appendChild(startBtn);
  };

  /********************
   * 테스트 진행 로직 (간단, 검수용)
   ********************/
  const startTest = () => {
    const ui = getUI();
    ui.welcomeView.style.display = 'none';
    ui.testView.style.display = 'block';
    state.currentIndex = 0;
    state.answers = [];
    renderQuestion();
  };

  const renderQuestion = () => {
    const ui = getUI();
    const q = state.questions[state.currentIndex];
    if (!q) {
      finishTest();
      return;
    }
    ui.questionContainer.innerHTML = '';
    const qText = document.createElement('div');
    qText.className = 'q-text';
    qText.textContent = q.text || '';
    ui.questionContainer.appendChild(qText);

    ui.optionsGroup.innerHTML = '';
    const labels = (state.ui.labels && Array.isArray(state.ui.labels)) ? state.ui.labels : ["전혀 아니다","아니다","보통이다","그렇다","매우 그렇다"];
    labels.forEach((lab, idx) => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.textContent = lab;
      btn.addEventListener('click', () => {
        const val = (q.direction === '-' ? (labels.length - 1 - idx) : idx);
        state.answers.push({ id: q.id, trait: q.trait, value: val });
        state.currentIndex++;
        renderQuestion();
      });
      ui.optionsGroup.appendChild(btn);
    });

    if (ui.progressFill) {
      const pct = Math.round((state.currentIndex / Math.max(1, state.questions.length)) * 100);
      ui.progressFill.style.width = pct + '%';
    }
  };

  const finishTest = () => {
    const traits = {};
    state.answers.forEach(a => {
      traits[a.trait] = (traits[a.trait] || 0) + Number(a.value || 0);
    });
    state.results = traits;
    showResults();
  };

  const showResults = () => {
    const ui = getUI();
    ui.welcomeView.style.display = 'none';
    ui.testView.style.display = 'block';
    ui.questionContainer.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'result-header';
    header.textContent = state.ui.reportTitle || '리포트';
    ui.questionContainer.appendChild(header);

    const body = document.createElement('div');
    body.className = 'result-body';
    Object.keys(state.traitNames || {}).forEach(k => {
      const row = document.createElement('div');
      row.className = 'trait-row';
      const label = document.createElement('div');
      label.className = 'trait-label';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = state.traitNames[k] || k;
      const scoreSpan = document.createElement('span');
      const scoreVal = state.results?.[k] ?? 0;
      scoreSpan.textContent = String(scoreVal);
      label.appendChild(nameSpan); label.appendChild(scoreSpan);
      const bg = document.createElement('div'); bg.className = 'bar-bg';
      const fill = document.createElement('div'); fill.className = 'bar-fill';
      const pct = Math.min(100, Math.round((scoreVal / (state.questions.length || 1)) * 100));
      fill.style.width = pct + '%';
      bg.appendChild(fill);
      row.appendChild(label);
      row.appendChild(bg);
      body.appendChild(row);
    });
    ui.questionContainer.appendChild(body);
  };

  /********************
   * 테스트 변경 및 결과 복원
   ********************/
  const changeTest = (testId) => {
    state.testId = testId;
    loadData().then(() => {
      if (state.guide && state.guide.purpose) renderGuide();
      else startTest();
    }).catch(() => {
      alert('해당 테스트 데이터 로드 실패(검수용). data 폴더와 JSON 구조를 확인하세요.');
      renderWelcome();
    });
  };

  // resData는 base64(JSON) 형식의 간단 복원 예시 (검수용)
  const decodeAndShowResult = (resData) => {
    try {
      const json = JSON.parse(atob(resData));
      state.results = json;
      showResults();
    } catch (e) {
      console.error('decodeAndShowResult 실패:', e);
      throw e;
    }
  };

  return {
    init,
    changeTest,
    startTest,
    decodeAndShowResult,
    getState: () => JSON.parse(JSON.stringify(state))
  };
})();

// DOMContentLoaded 이후 초기화
window.addEventListener('DOMContentLoaded', () => {
  if (window.GIPPP_ENGINE && typeof window.GIPPP_ENGINE.init === 'function') {
    try { window.GIPPP_ENGINE.init(); } catch (e) { console.error('Engine init error', e); }
  }
});
