const GIPPP_ENGINE = (() => {
    // 기획자님이 주신 v3.9 상태 구조 그대로 유지
    let state = { testId: 'ocean', currentIndex: 0, answers: [], questions: [], descriptions: {}, traitNames: {}, lang: 'en', results: null };

    // 기획자님이 주신 uiStrings 구조 그대로 유지 (테스트 명칭만 흥미 유발형으로 업데이트)
    const uiStrings = {
        ar: { desc: "الطريقة الأكثر حساسية لقراءتك", security: "🔒 الأمان: لا يتم تخزين البيانات", processing: "جاري التحليل...", wait: "يرجى الانتظار...", saveImg: "حفظ الصورة", retest: "إعادة", reportTitle: "تقرير البصيرة", recommendTitle: "💡 مقترح لك", viewAmazon: "عرض على أمازون", qrNote: "امسح للحفظ", viralTitle: "هل أنت فضولي؟", viralSub: "امسح للبدء", labels: ["أرفض بشدة", "أرفض", "محايد", "أوافق", "أوافق بشدة"], tests: { ocean: "تحليل الشخصية", loc: "عقلية النجاح", dark: "البحث عن الشرير", trust: "مقياس العلاقات", resilience: "اختبار المرونة" } },
        de: { desc: "Der sensibelste Weg, dich zu verstehen", security: "🔒 Keine Datenspeicherung", processing: "Analyse...", wait: "Bitte warten...", saveImg: "Bild speichern", retest: "Neu starten", reportTitle: "Insight-Bericht", recommendTitle: "💡 Empfohlen", viewAmazon: "Auf Amazon", qrNote: "QR scannen", viralTitle: "Neugierig?", viralSub: "QR scannen", labels: ["Stimme gar nicht zu", "Stimme nicht zu", "Neutral", "Stimme zu", "Stimme voll zu"], tests: { ocean: "Big Five", loc: "Erfolgs-Mindset", dark: "Bösewicht-Finder", trust: "Soziales Vertrauen", resilience: "Resilienz-Test" } },
        en: { desc: "The most sensible way to read you", security: "🔒 Security: No data stored", processing: "Analyzing...", wait: "Please wait...", saveImg: "📸 Save Image", retest: "Retest", reportTitle: "Insight Report", recommendTitle: "💡 Recommended", viewAmazon: "View on Amazon", qrNote: "Scan to save", viralTitle: "Curious about your insight?", viralSub: "Scan QR to start", labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"], tests: { ocean: "Big Five", loc: "Success Mindset", dark: "Villain Finder", trust: "Social Trust", resilience: "Resilience Test" } },
        es: { desc: "La forma más sensible de leerte", security: "🔒 Sin datos guardados", processing: "Analizando...", wait: "Espere...", saveImg: "Guardar Imagen", retest: "Reiniciar", reportTitle: "Informe", recommendTitle: "💡 Recomendado", viewAmazon: "Ver en Amazon", qrNote: "Escanea", viralTitle: "¿Curioso?", viralSub: "Escanea el QR", labels: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"], tests: { ocean: "Personalidad Big Five", loc: "Mentalidad de Éxito", dark: "Buscador de Villanos", trust: "Confianza Social", resilience: "Test de Resiliencia" } },
        ja: { desc: "あなたを読み解く最も感性的な方法", security: "🔒 データ保存なし", processing: "分析中...", wait: "お待ちください...", saveImg: "画像を保存", retest: "再試行", reportTitle: "レポート", recommendTitle: "💡 おすすめ", viewAmazon: "Amazonで見る", qrNote: "スキャンして保存", viralTitle: "気になりますか？", viralSub: "QRで開始", labels: ["全くそう思わない", "そう思わない", "どちらともいえない", "そう思う", "強く思う"], tests: { ocean: "本性分析", loc: "成功マインド", dark: "隠れたヴィラン", trust: "人間関係温度計", resilience: "メンタル診断" } },
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", security: "🔒 보안: 데이터 저장 안 함", processing: "분석 중...", wait: "잠시만 기다려 주세요.", saveImg: "📸 이미지 저장", retest: "다시 하기", reportTitle: "인사이트 리포트", recommendTitle: "💡 맞춤 추천", viewAmazon: "아마존 보기", qrNote: "스캔하여 결과 소장", viralTitle: "당신의 인사이트가 궁금하다면?", viralSub: "QR코드를 스캔하여 테스트 시작", labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"], tests: { ocean: "나의 본캐 분석", loc: "성공 마인드셋", dark: "내 안의 빌런 찾기", trust: "인간관계 온도계", resilience: "강철 멘탈 테스트" } },
        pt: { desc: "A forma mais sensata de te ler", security: "🔒 Sem dados guardados", processing: "Analisando...", wait: "Aguarde...", saveImg: "Salvar Imagem", retest: "Reiniciar", reportTitle: "Relatório", recommendTitle: "💡 Recomendado", viewAmazon: "Ver na Amazon", qrNote: "Escaneie", viralTitle: "Curioso?", viralSub: "Escaneie o QR", labels: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"], tests: { ocean: "Personalidade Big Five", loc: "Mentalidade de Sucesso", dark: "Buscador de Vilões", trust: "Confiança Social", resilience: "Teste de Resiliência" } },
        ru: { desc: "Самый разумный способ понять себя", security: "🔒 Без сохранения данных", processing: "Анализ...", wait: "Подождите...", saveImg: "Сохранить", retest: "Заново", reportTitle: "Отчет", recommendTitle: "💡 Рекомендовано", viewAmazon: "На Amazon", qrNote: "Сканируйте", viralTitle: "Интересно?", viralSub: "Сканируйте QR", labels: ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"], tests: { ocean: "Большая пятерка", loc: "Локус контроля", dark: "Темная триада", trust: "Социальное доверие", resilience: "Жизнестойкость" } },
        vi: { desc: "Cách nhạy bén nhất để hiểu bạn", security: "🔒 Không lưu dữ liệu", processing: "Đang phân tích...", wait: "Chờ chút...", saveImg: "Lưu ảnh", retest: "Làm lại", reportTitle: "Báo cáo", recommendTitle: "💡 Gợi ý", viewAmazon: "Xem trên Amazon", qrNote: "Quét để lưu", viralTitle: "Bạn tò mò?", viralSub: "Quét QR để bắt đầu", labels: ["Rất không đồng ý", "Không đồng ý", "Bình thường", "Đồng ý", "Rất đồng ý"], tests: { ocean: "Tính cách Big Five", loc: "Kiểm soát tâm thế", dark: "Bộ ba đen tối", trust: "Lòng tin xã hội", resilience: "Khả năng phục hồi" } },
        zh: { desc: "解读你最感性的方式", security: "🔒 不存储数据", processing: "分析中...", wait: "请稍等...", saveImg: "保存图片", retest: "重测", reportTitle: "报告", recommendTitle: "💡 推荐", viewAmazon: "亚马逊", qrNote: "扫描保存", viralTitle: "想了解吗？", viralSub: "扫码开始", labels: ["极不同意", "不同意", "中立", "同意", "极同意"], tests: { ocean: "大五人格测试", loc: "控制点测试", dark: "黑暗人格三联征", trust: "社会信任度", resilience: "心理韧性测试" } }
    };

    const amazonProducts = { E: "party games", A: "gift sets", C: "planner", N: "meditation", O: "art supplies", L: "wealth mindset books", N_dark: "leadership books", M: "strategy games", P: "resilience books", T: "social capital books", R: "stress relief" };
    
    // UI 요소 참조 (v3.9 방식 유지 + View 제어용 추가)
    const ui = { 
        brandDesc: document.getElementById('brand-desc'), 
        securityNote: document.getElementById('security-note'), 
        questionText: document.getElementById('question-text'), 
        optionsGroup: document.getElementById('options-group'), 
        progressFill: document.getElementById('progress-fill'), 
        mainContent: document.getElementById('main-content'), 
        langSelect: document.getElementById('lang-select'),
        welcomeView: document.getElementById('welcome-view'),
        testView: document.getElementById('test-view'),
        header: document.getElementById('main-header')
    };

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        state.testId = urlParams.get('test'); 
        let userLang = urlParams.get('lang') || navigator.language.substring(0, 2);
        if (userLang === 'jp') userLang = 'ja'; if (userLang === 'vn') userLang = 'vi';
        state.lang = uiStrings[userLang] ? userLang : 'en';
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        
        const s = uiStrings[state.lang];
        ui.brandDesc.innerText = s.desc;
        ui.securityNote.innerText = s.security;
        
        // 언어 선택기 동적 생성
        ui.langSelect.innerHTML = Object.keys(uiStrings).map(l => `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('');
        
        const resData = urlParams.get('res');

        // 뷰 전환 로직 (v3.9 로직을 방해하지 않음)
        if (resData) {
            ui.welcomeView.style.display = 'none';
            ui.header.style.display = 'none';
            ui.testView.style.display = 'block';
            decodeAndShowResult(resData);
        } else if (state.testId) {
            ui.welcomeView.style.display = 'none';
            ui.header.style.display = 'none';
            ui.testView.style.display = 'block';
            await loadData();
            renderQuestion();
        } else {
            ui.welcomeView.style.display = 'block';
            ui.header.style.display = 'block';
            ui.testView.style.display = 'none';
        }
    };

    const changeLanguage = (l) => { const u = new URL(window.location.href); u.searchParams.set('lang', l); window.location.href = u.toString(); };
    const changeTest = (t) => { const u = new URL(window.location.href); u.searchParams.set('test', t); u.searchParams.delete('res'); window.location.href = u.toString(); };

    const loadData = async () => {
        try {
            const r = await fetch(`./data/${state.testId}/${state.lang}.json`);
            const d = await r.json();
            state.questions = d.items;
            state.descriptions = d.descriptions;
            state.traitNames = d.traitNames || {};
        } catch (e) { if(ui.questionText) ui.questionText.innerText = "Data Load Error."; }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        const s = uiStrings[state.lang];
        // v3.9의 렌더링 방식 그대로 복구
        ui.questionText.innerHTML = `<div>${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = s.labels[score - 1];
            btn.onclick = () => {
                state.answers.push({ trait: q.trait, score: q.direction === "-" ? 6 - score : score });
                if (++state.currentIndex < state.questions.length) renderQuestion(); else showProcessing();
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        const s = uiStrings[state.lang];
        ui.testView.innerHTML = `<div style="padding:40px 0;"><div class="spinner"></div><h3>${s.processing}</h3><p>${s.wait}</p><div class="ad-slot" style="height:250px;"></div></div>`;
        setTimeout(() => { state.results = calculateScores(); renderFinalReport(); }, 3000);
    };

    const calculateScores = () => state.answers.reduce((acc, curr) => {
        if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
        acc[curr.trait].total += curr.score; acc[curr.trait].count += 1;
        return acc;
    }, {});

    const renderFinalReport = () => {
        const s = uiStrings[state.lang];
        const resCode = Object.entries(state.results).map(([t, d]) => t + Math.round((d.total / (d.count * 5)) * 100)).join('');
        const shareUrl = `${window.location.origin}${window.location.pathname}?test=${state.testId}&lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        
        let maxTrait = '', maxScore = -1;
        let reportHtml = `<div class="result-card"><h2 style="text-align:center; color:#3498db; border-bottom:2px solid #3498db; padding-bottom:15px;">${s.reportTitle}</h2><div class="ad-slot" style="height:60px;"></div>`;
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            const traitDisplayName = state.traitNames[trait] || trait;
            reportHtml += `<div style="margin-bottom:15px; text-align:left;"><strong>${traitDisplayName} ${p}%</strong><div style="width:100%; height:10px; background:#f0f0f0; border-radius:6px; overflow:hidden; margin-top:5px;"><div style="width:${p}%; height:100%; background:#3498db;"></div></div><p style="font-size:0.9rem; color:#555; margin-top:5px;">${p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low}</p></div>`;
        }
        reportHtml += `<div style="background:#fff9e6; padding:15px; border-radius:15px; text-align:center; margin:20px 0; border:1px solid #ffeaa7;"><h4>${s.recommendTitle}</h4><a href="https://www.amazon.com/s?k=${amazonProducts[maxTrait] || 'psychology'}" target="_blank" style="color:#ff9900; font-weight:bold; text-decoration:none;">${s.viewAmazon}</a></div><div class="ad-slot" style="height:100px;"></div>`;
        reportHtml += `<div style="text-align:center; margin-bottom:20px;"><img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous" style="width:130px; border:6px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></div>`;
        reportHtml += `<button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:18px; background:#3498db; color:white; border:none; border-radius:15px; font-weight:bold; font-size:1.1rem; cursor:pointer; margin-bottom:10px;">${s.saveImg}</button>`;
        reportHtml += `<button onclick="location.href=window.location.pathname" style="width:100%; padding:12px; background:#f8f9fa; color:#95a5a6; border:none; border-radius:15px; cursor:pointer;">${s.retest}</button></div><canvas id="resultCanvas" style="display:none;"></canvas>`;
        ui.testView.innerHTML = reportHtml;
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
        const s = uiStrings[state.lang];
        const isRTL = (state.lang === 'ar');
        
        const traits = Object.entries(state.results);
        canvas.width = 600; canvas.height = 400 + (traits.length * 100);
        
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, canvas.width, 110);
        ctx.fillStyle = 'white'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.reportTitle, 300, 65);
        
        let y = 200;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            const traitDisplayName = state.traitNames[t] || t;
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 24px sans-serif';
            if (isRTL) { 
                ctx.textAlign = 'right'; ctx.fillText(traitDisplayName, 540, y); 
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 60, y); 
                ctx.fillStyle = '#f0f0f0'; ctx.fillRect(60, y + 15, 480, 20); 
                ctx.fillStyle = '#3498db'; ctx.fillRect(540 - (480 * p / 100), y + 15, (480 * p) / 100, 20); 
            } else { 
                ctx.textAlign = 'left'; ctx.fillText(traitDisplayName, 60, y); 
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y); 
                ctx.fillStyle = '#f0f0f0'; ctx.fillRect(60, y + 15, 480, 20); 
                ctx.fillStyle = '#3498db'; ctx.fillRect(60, y + 15, (480 * p) / 100, 20); 
            }
            y += 100;
        });
        
        const footerY = canvas.height - 200;
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, footerY, 600, 200);
        if (qrImg && qrImg.complete) { ctx.drawImage(qrImg, 50, footerY + 25, 150, 150); }
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = isRTL ? 'right' : 'left';
        const textX = isRTL ? 540 : 220;
        ctx.fillText(s.viralTitle, textX, footerY + 75);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '18px sans-serif';
        ctx.fillText(s.viralSub, textX, footerY + 110);
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#3498db';
        ctx.fillText('gippp.github.io', textX, footerY + 140);
        
        const link = document.createElement('a'); link.download = `GIPPP_Report.png`; link.href = canvas.toDataURL('image/png'); link.click();
    };

    return { init, changeLanguage, changeTest, generateImage, getTestId: () => state.testId };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
