/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v3.5
 * Focus: Modular Directory Routing (?test=...), Multi-Test Support
 */

const GIPPP_ENGINE = (() => {
    let state = { 
        testId: 'ocean', // 기본값
        currentIndex: 0, 
        answers: [], 
        questions: [], 
        descriptions: {}, 
        lang: 'en', 
        results: null 
    };

    // UI 문자열 (검사 종류와 상관없이 공통 적용)
    const uiStrings = {
        ar: { desc: "محلل البصيرة العالمي", security: "🔒 الأمان: لا يتم تخزين البيانات", processing: "جاري التحليل...", wait: "يرجى الانتظار لحظة...", saveImg: "حفظ الصورة", retest: "إعادة الاختبار", reportTitle: "تقرير البصيرة", recommendTitle: "💡 مقترح لك", viewAmazon: "عرض على أمازون", qrNote: "امسح الكود للحفظ", viralTitle: "هل أنت فضولي بشأن بصيرتك؟", viralSub: "امسح الكود للبدء", labels: ["أرفض بشدة", "أرفض", "محايد", "أوافق", "أوافق بشدة"] },
        de: { desc: "Globaler Insight-Profiler", security: "🔒 Sicherheit: Keine Datenspeicherung", processing: "Analysiere...", wait: "Bitte warten...", saveImg: "Bild speichern", retest: "Neu starten", reportTitle: "Insight-Bericht", recommendTitle: "💡 Empfohlen für Sie", viewAmazon: "Auf Amazon ansehen", qrNote: "QR-Code scannen zum Starten", viralTitle: "Neugierig auf Ihre Insights?", viralSub: "QR-Code scannen zum Starten", labels: ["Stimme gar nicht zu", "Stimme nicht zu", "Neutral", "Stimme zu", "Stimme voll zu"] },
        en: { desc: "Global Insight Profiler", security: "🔒 Security: No data stored", processing: "Analyzing...", wait: "Please wait...", saveImg: "📸 Save Image", retest: "Retest", reportTitle: "Insight Report", recommendTitle: "💡 Recommended", viewAmazon: "View on Amazon", qrNote: "Scan QR to start test", viralTitle: "Curious about your insight?", viralSub: "Scan QR to start your test", labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] },
        es: { desc: "Perfilador de Perspectiva Global", security: "🔒 Seguridad: Sin datos guardados", processing: "Analizando...", wait: "Por favor espere...", saveImg: "📸 Guardar Imagen", retest: "Reiniciar", reportTitle: "Informe de Perspectiva", recommendTitle: "💡 Recomendado", viewAmazon: "Ver en Amazon", qrNote: "Escanea para comenzar", viralTitle: "¿Curioso por tu intuición?", viralSub: "Escanea el QR para comenzar", labels: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"] },
        ja: { desc: "グローバル・インサイト・プロファイラー", security: "🔒 セキュリティ: データ保存なし", processing: "分析中...", wait: "少々お待ちください...", saveImg: "📸 画像を保存", retest: "再テスト", reportTitle: "インサイトレポート", recommendTitle: "💡 おすすめ商品", viewAmazon: "Amazonで見る", qrNote: "QRコードをスキャンして開始", viralTitle: "あなたのインサイトが気になりますか？", viralSub: "QRコードをスキャンして開始", labels: ["全くそう思わない", "そう思わない", "どちらともいえない", "そう思う", "強くそう思う"] },
        ko: { desc: "글로벌 인사이트 프로파일러", security: "🔒 보안: 데이터 저장 안 함", processing: "분석 중...", wait: "잠시만 기다려 주세요.", saveImg: "📸 이미지 저장", retest: "다시 하기", reportTitle: "인사이트 리포트", recommendTitle: "💡 맞춤 추천", viewAmazon: "아마존 보기", qrNote: "QR코드를 스캔하여 테스트 시작", viralTitle: "당신의 인사이트가 궁금하다면?", viralSub: "QR코드를 스캔하여 테스트 시작", labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"] },
        pt: { desc: "Perfilador de Insights Global", security: "🔒 Segurança: Sem armazenamento de dados", processing: "Analisando...", wait: "Por favor, aguarde...", saveImg: "📸 Salvar Imagem", retest: "Reiniciar", reportTitle: "Relatório de Insights", recommendTitle: "💡 Recomendado para você", viewAmazon: "Ver na Amazon", qrNote: "Escaneie o QR para começar", viralTitle: "Curioso sobre seu insight?", viralSub: "Escaneie o QR para começar", labels: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
        ru: { desc: "Глобальный профилировщик инсайтов", security: "🔒 Безопасность: данные не сохраняются", processing: "Анализ...", wait: "Пожалуйста, подождите...", saveImg: "📸 Сохранить изображение", retest: "Пройти снова", reportTitle: "Отчет об инсайтах", recommendTitle: "💡 Рекомендовано для вас", viewAmazon: "Смотреть на Amazon", qrNote: "Сканируйте QR, чтобы начать", viralTitle: "Хотите узнать свои инсайты?", viralSub: "Сканируйте QR, чтобы начать", labels: ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"] },
        vi: { desc: "Hệ thống Phân tích Tâm lý Toàn cầu", security: "🔒 Bảo mật: Không lưu trữ dữ liệu", processing: "Đang phân tích...", wait: "Vui lòng chờ...", saveImg: "📸 Lưu hình ảnh", retest: "Làm lại", reportTitle: "Báo cáo Tâm lý", recommendTitle: "💡 Gợi ý cho bạn", viewAmazon: "Xem trên Amazon", qrNote: "Quét mã QR để bắt đầu", viralTitle: "Bạn muốn biết tâm lý của mình?", viralSub: "Quét mã QR để bắt đầu", labels: ["Rất không đồng ý", "Không đồng ý", "Bình thường", "Đồng ý", "Rất đồng ý"] },
        zh: { desc: "全球洞察剖析器", security: "🔒 安全：不存储任何数据", processing: "正在分析...", wait: "请稍等...", saveImg: "📸 保存结果图片", retest: "重新测试", reportTitle: "洞察报告", recommendTitle: "💡 为您推荐", viewAmazon: "在亚马逊查看", qrNote: "扫描二维码开始测试", viralTitle: "想了解你的内在洞察吗？", viralSub: "扫描二维码开始测试", labels: ["极不同意", "不同意", "中立", "同意", "极同意"] }
    };

    const amazonProducts = { E: "party games", A: "gift sets", C: "planner", N: "meditation", O: "art supplies", L: "wealth mindset books" };
    const ui = { brandDesc: document.getElementById('brand-desc'), securityNote: document.getElementById('security-note'), questionText: document.getElementById('question-text'), optionsGroup: document.getElementById('options-group'), progressFill: document.getElementById('progress-fill'), mainContent: document.getElementById('main-content'), langSelect: document.getElementById('lang-select') };

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. 테스트 종류 결정 (?test=loc 등)
        state.testId = urlParams.get('test') || 'ocean';
        
        // 2. 언어 결정
        let userLang = urlParams.get('lang') || navigator.language.substring(0, 2);
        if (userLang === 'jp') userLang = 'ja';
        if (userLang === 'vn') userLang = 'vi';
        state.lang = uiStrings[userLang] ? userLang : 'en';
        
        // RTL 대응
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        
        const s = uiStrings[state.lang];
        ui.brandDesc.innerText = s.desc;
        ui.securityNote.innerText = s.security;
        ui.langSelect.value = state.lang;
        
        await loadData();
        const resData = urlParams.get('res');
        if (resData) decodeAndShowResult(resData); else renderQuestion();
    };

    const changeLanguage = (l) => { 
        const u = new URL(window.location.href); 
        u.searchParams.set('lang', l); 
        window.location.href = u.toString(); 
    };

    const loadData = async () => {
        try {
            // [핵심] 폴더 구조에 맞게 경로 수정: data/{testId}/{lang}.json
            const r = await fetch(`./data/${state.testId}/${state.lang}.json`);
            if (!r.ok) throw new Error("File not found");
            const d = await r.json();
            state.questions = d.items;
            state.descriptions = d.descriptions;
        } catch (e) { 
            ui.questionText.innerText = "Data Load Error. Check folder structure."; 
        }
    };

    const renderQuestion = () => {
        if (!state.questions || !state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        const s = uiStrings[state.lang];
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
        ui.mainContent.innerHTML = `<div style="padding:40px 0;"><div class="spinner"></div><h3>${s.processing}</h3><p>${s.wait}</p></div>`;
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
        let reportHtml = `<div class="result-card"><h2 style="text-align:center; color:#3498db; border-bottom:2px solid #3498db; padding-bottom:15px;">${s.reportTitle}</h2>`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = data.count === 20 ? data.total : Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            
            // trait 이름이 uiStrings에 없을 경우를 대비한 방어 로직
            const traitName = (s.traits && s.traits[trait]) ? s.traits[trait] : trait;

            reportHtml += `<div style="margin-bottom:20px;"><strong>${traitName} ${p}%</strong><div style="width:100%; height:12px; background:#f0f0f0; border-radius:6px; overflow:hidden; margin-top:5px;"><div style="width:${p}%; height:100%; background:#3498db;"></div></div><p style="font-size:0.95rem; color:#555; margin-top:8px; line-height:1.4;">${p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low}</p></div>`;
        }
        
        const amazonKeyword = amazonProducts[maxTrait] || "psychology books";
        reportHtml += `<div style="background:#fff9e6; padding:20px; border-radius:20px; text-align:center; margin:30px 0; border:1px solid #ffeaa7;"><h4>${s.recommendTitle}</h4><a href="https://www.amazon.com/s?k=${amazonKeyword}" target="_blank" style="color:#ff9900; font-weight:bold; text-decoration:none; font-size:1.1rem;">${s.viewAmazon}</a></div>`;
        reportHtml += `<div style="text-align:center; margin-bottom:30px;"><img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous" style="width:140px; border:6px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></div>`;
        reportHtml += `<button onclick="GIPPP_ENGINE.generateImage()" style="width:100%; padding:20px; background:#3498db; color:white; border:none; border-radius:15px; font-weight:bold; font-size:1.2rem; cursor:pointer; margin-bottom:15px;">${s.saveImg}</button>`;
        reportHtml += `<button onclick="location.href=window.location.pathname + '?test=' + GIPPP_ENGINE.getTestId()" style="width:100%; padding:15px; background:#f8f9fa; color:#95a5a6; border:none; border-radius:15px; cursor:pointer;">${s.retest}</button></div><canvas id="resultCanvas" style="display:none;"></canvas>`;
        ui.mainContent.innerHTML = reportHtml;
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
        
        canvas.width = 600; canvas.height = 950;
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 600, 950);
        ctx.fillStyle = '#3498db'; ctx.fillRect(0, 0, 600, 110);
        ctx.fillStyle = 'white'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.reportTitle, 300, 65);

        let y = 200;
        Object.entries(state.results).forEach(([t, d]) => {
            const p = d.count === 20 ? d.total : Math.round((d.total / (d.count * 5)) * 100);
            const traitName = (s.traits && s.traits[t]) ? s.traits[t] : t;
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 24px sans-serif';
            
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(traitName, 540, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 60, y);
                ctx.fillStyle = '#f0f0f0'; ctx.fillRect(60, y + 15, 480, 20);
                ctx.fillStyle = '#3498db'; ctx.fillRect(540 - (480 * p / 100), y + 15, (480 * p) / 100, 20);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(traitName, 60, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y);
                ctx.fillStyle = '#f0f0f0'; ctx.fillRect(60, y + 15, 480, 20);
                ctx.fillStyle = '#3498db'; ctx.fillRect(60, y + 15, (480 * p) / 100, 20);
            }
            y += 100;
        });

        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(0, 750, 600, 200);
        if (qrImg && qrImg.complete) { ctx.drawImage(qrImg, 50, 775, 150, 150); }
        
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = isRTL ? 'right' : 'left';
        const textX = isRTL ? 540 : 220;
        ctx.fillText(s.viralTitle, textX, 825);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '18px sans-serif';
        ctx.fillText(s.viralSub, textX, 860);
        ctx.font = 'bold 16px sans-serif'; ctx.fillStyle = '#3498db';
        ctx.fillText('gippp-project.github.io', textX, 890);

        const link = document.createElement('a'); 
        link.download = `GIPPP_Report_${state.lang}.png`; 
        link.href = canvas.toDataURL('image/png'); 
        link.click();
    };

    return { init, changeLanguage, generateImage, getTestId: () => state.testId };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
