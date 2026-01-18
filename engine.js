const GIPPP_ENGINE = (() => {
    // 5대 원칙 준수: 모든 상태는 휘발성 메모리에만 존재
    let state = { 
        testId: null, 
        currentIndex: 0, 
        answers: [], 
        questions: [], 
        descriptions: {}, 
        traitNames: {}, 
        lang: 'en', 
        results: null 
    };

    const uiStrings = {
        ko: { desc: "당신을 읽어내는 가장 감각적인 방법", security: "🔒 보안: 데이터 저장 안 함", processing: "분석 중...", wait: "잠시만 기다려 주세요.", saveImg: "📸 이미지 저장", retest: "다시 하기", reportTitle: "인사이트 리포트", recommendTitle: "💡 맞춤 추천", viewAmazon: "아마존 보기", qrNote: "스캔하여 결과 소장", viralTitle: "당신의 인사이트가 궁금하다면?", viralSub: "QR코드를 스캔하여 테스트 시작", labels: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"], tests: { ocean: "나의 본캐 분석", loc: "성공 마인드셋", dark: "내 안의 빌런 찾기", trust: "인간관계 온도계", resilience: "강철 멘탈 테스트" } },
        en: { desc: "The most sensible way to read you", security: "🔒 Security: No data stored", processing: "Analyzing...", wait: "Please wait...", saveImg: "📸 Save Image", retest: "Retest", reportTitle: "Insight Report", recommendTitle: "💡 Recommended", viewAmazon: "View on Amazon", qrNote: "Scan to save", viralTitle: "Curious about your insight?", viralSub: "Scan QR to start", labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"], tests: { ocean: "Big Five", loc: "Success Mindset", dark: "Villain Finder", trust: "Social Trust", resilience: "Resilience Test" } },
        ar: { desc: "الطريقة الأكثر حساسية لقراءتك", security: "🔒 الأمان: لا يتم تخزين البيانات", processing: "جاري التحليل...", wait: "يرجى الانتظار...", saveImg: "حفظ الصورة", retest: "إعادة", reportTitle: "تقرير البصيرة", recommendTitle: "💡 مقترح لك", viewAmazon: "عرض على أمازون", qrNote: "امسح للحفظ", viralTitle: "هل أنت فضولي؟", viralSub: "امسح للبدء", labels: ["أرفض بشدة", "أرفض", "محايد", "أوافق", "أوافق بشدة"], tests: { ocean: "تحليل الشخصية", loc: "عقلية النجاح", dark: "البحث عن الشرير", trust: "مقياس العلاقات", resilience: "اختبار المرونة" } },
        ja: { desc: "あなたを読み解く最も感性的な方法", security: "🔒 データ保存なし", processing: "分析中...", wait: "お待ちください...", saveImg: "画像を保存", retest: "再試行", reportTitle: "レポート", recommendTitle: "💡 おすすめ", viewAmazon: "Amazonで見る", qrNote: "스캔하여 저장", viralTitle: "気になりますか？", viralSub: "QRで開始", labels: ["全くそう思わない", "そう思わない", "どちらともいえない", "そう思う", "強く思う"], tests: { ocean: "本性分析", loc: "成功マインド", dark: "隠れたヴィラン", trust: "人間관계 온도계", resilience: "멘탈 진단" } }
        // (기타 국가 생략 - 필요시 추가 가능)
    };

    const amazonProducts = { E: "party games", A: "gift sets", C: "planner", N: "meditation", O: "art supplies", L: "wealth mindset books", N_dark: "leadership books", M: "strategy games", P: "resilience books", T: "social capital books", R: "stress relief" };
    
    const ui = { 
        brandDesc: null, securityNote: null, questionText: null, optionsGroup: null, 
        progressFill: null, langSelect: null, welcomeView: null, testView: null, header: null 
    };

    const init = async () => {
        // UI 요소 바인딩
        ui.brandDesc = document.getElementById('brand-desc');
        ui.securityNote = document.getElementById('security-note');
        ui.questionText = document.getElementById('question-text');
        ui.optionsGroup = document.getElementById('options-group');
        ui.progressFill = document.getElementById('progress-fill');
        ui.langSelect = document.getElementById('lang-select');
        ui.welcomeView = document.getElementById('welcome-view');
        ui.testView = document.getElementById('test-view');
        ui.header = document.getElementById('main-header');

        const urlParams = new URLSearchParams(window.location.search);
        state.testId = urlParams.get('test'); 
        let userLang = urlParams.get('lang') || navigator.language.substring(0, 2);
        state.lang = uiStrings[userLang] ? userLang : 'en';
        
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        
        const s = uiStrings[state.lang];
        ui.brandDesc.innerText = s.desc;
        ui.securityNote.innerText = s.security;
        
        // 언어 선택기 생성
        ui.langSelect.innerHTML = Object.keys(uiStrings).map(l => `<option value="${l}" ${state.lang === l ? 'selected' : ''}>${l.toUpperCase()}</option>`).join('');
        
        const resData = urlParams.get('res');

        if (resData) {
            showView('test');
            decodeAndShowResult(resData);
        } else if (state.testId) {
            showView('test');
            await loadData();
            renderQuestion();
        } else {
            showView('welcome');
        }
    };

    const showView = (view) => {
        if (view === 'welcome') {
            ui.welcomeView.style.display = 'block';
            ui.header.style.display = 'block';
            ui.testView.style.display = 'none';
        } else {
            ui.welcomeView.style.display = 'none';
            ui.header.style.display = 'none';
            ui.testView.style.display = 'block';
        }
    };

    const changeLanguage = (l) => { 
        const u = new URL(window.location.href); 
        u.searchParams.set('lang', l); 
        window.location.href = u.toString(); 
    };

    const changeTest = (t) => { 
        const u = new URL(window.location.href); 
        u.searchParams.set('test', t); 
        u.searchParams.delete('res'); 
        window.location.href = u.toString(); 
    };

    const loadData = async () => {
        try {
            const r = await fetch(`./data/${state.testId}/${state.lang}.json`);
            const d = await r.json();
            state.questions = d.items;
            state.descriptions = d.descriptions;
            state.traitNames = d.traitNames || {};
        } catch (e) { 
            ui.questionText.innerText = "Data Load Error. Please check path: ./data/" + state.testId; 
        }
    };

    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        const s = uiStrings[state.lang];
        
        ui.questionText.innerHTML = `<div class="q-text">${q.text}</div>`;
        ui.optionsGroup.innerHTML = '';
        
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = s.labels[score - 1];
            btn.onclick = () => {
                state.answers.push({ trait: q.trait, score: q.direction === "-" ? 6 - score : score });
                if (++state.currentIndex < state.questions.length) {
                    renderQuestion();
                } else {
                    showProcessing();
                }
            };
            ui.optionsGroup.appendChild(btn);
        });
        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    const showProcessing = () => {
        const s = uiStrings[state.lang];
        ui.testView.innerHTML = `
            <div class="processing-view">
                <div class="spinner"></div>
                <h3>${s.processing}</h3>
                <p>${s.wait}</p>
                <div class="ad-placeholder">AD SLOT</div>
            </div>`;
        setTimeout(() => { 
            state.results = calculateScores(); 
            renderFinalReport(); 
        }, 3000);
    };

    const calculateScores = () => state.answers.reduce((acc, curr) => {
        if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
        acc[curr.trait].total += curr.score; 
        acc[curr.trait].count += 1;
        return acc;
    }, {});

    const renderFinalReport = () => {
        const s = uiStrings[state.lang];
        // 결과 복원용 Regex 코드 생성
        const resCode = Object.entries(state.results).map(([t, d]) => t + Math.round((d.total / (d.count * 5)) * 100)).join('');
        const shareUrl = `${window.location.origin}${window.location.pathname}?test=${state.testId}&lang=${state.lang}&res=${resCode}`;
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        
        let maxTrait = '', maxScore = -1;
        let reportHtml = `<div class="result-card"><h2>${s.reportTitle}</h2>`;
        
        for (const [trait, data] of Object.entries(state.results)) {
            const p = Math.round((data.total / (data.count * 5)) * 100);
            if (p > maxScore) { maxScore = p; maxTrait = trait; }
            const traitDisplayName = state.traitNames[trait] || trait;
            const desc = p >= 50 ? state.descriptions[trait].high : state.descriptions[trait].low;
            
            reportHtml += `
                <div class="trait-row">
                    <div class="trait-info"><strong>${traitDisplayName}</strong> <span>${p}%</span></div>
                    <div class="bar-bg"><div class="bar-fill" style="width:${p}%"></div></div>
                    <p class="trait-desc">${desc}</p>
                </div>`;
        }

        reportHtml += `
            <div class="recommend-box">
                <h4>${s.recommendTitle}</h4>
                <a href="https://www.amazon.com/s?k=${amazonProducts[maxTrait] || 'psychology'}" target="_blank">${s.viewAmazon}</a>
            </div>
            <div class="qr-section">
                <img id="qrImage" src="${qrImgUrl}" crossorigin="anonymous">
                <p>${s.qrNote}</p>
            </div>
            <button class="btn-main" onclick="GIPPP_ENGINE.generateImage()">${s.saveImg}</button>
            <button class="btn-sub" onclick="location.href=window.location.pathname">${s.retest}</button>
            <canvas id="resultCanvas" style="display:none;"></canvas>
        </div>`;
        
        ui.testView.innerHTML = reportHtml;
    };

    const decodeAndShowResult = (c) => {
        const s = {}; 
        const m = c.match(/([A-Z])(\d+)/g);
        if (m) {
            m.forEach(x => { 
                const trait = x[0];
                const score = parseInt(x.substring(1));
                s[trait] = { total: score, count: 20 }; // 가중치 역산
            });
        }
        state.results = s; 
        // 결과 복원 시에는 데이터 로드가 필요함 (지표명 때문)
        loadData().then(() => renderFinalReport());
    };

    const generateImage = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const qrImg = document.getElementById('qrImage');
        const s = uiStrings[state.lang];
        const isRTL = (state.lang === 'ar');
        
        const traits = Object.entries(state.results);
        canvas.width = 600; 
        canvas.height = 450 + (traits.length * 90); // 동적 높이 계산
        
        // 배경
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, 0, canvas.width, 100);
        
        // 타이틀
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(s.reportTitle, 300, 60);
        
        let y = 180;
        traits.forEach(([t, d]) => {
            const p = Math.round((d.total / (d.count * 5)) * 100);
            const traitDisplayName = state.traitNames[t] || t;
            
            ctx.fillStyle = '#34495e'; ctx.font = 'bold 22px sans-serif';
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(traitDisplayName, 540, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 60, y);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(traitDisplayName, 60, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y);
            }
            
            ctx.fillStyle = '#ecf0f1'; ctx.fillRect(60, y + 15, 480, 15);
            ctx.fillStyle = '#3498db';
            if (isRTL) ctx.fillRect(540 - (480 * p / 100), y + 15, (480 * p) / 100, 15);
            else ctx.fillRect(60, y + 15, (480 * p) / 100, 15);
            
            y += 90;
        });
        
        // 푸터 (QR 및 바이럴)
        const footerY = canvas.height - 180;
        ctx.fillStyle = '#f9f9f9'; ctx.fillRect(0, footerY, 600, 180);
        if (qrImg && qrImg.complete) ctx.drawImage(qrImg, 50, footerY + 20, 140, 140);
        
        ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = isRTL ? 'right' : 'left';
        const tx = isRTL ? 540 : 210;
        ctx.fillText(s.viralTitle, tx, footerY + 60);
        ctx.fillStyle = '#7f8c8d'; ctx.font = '16px sans-serif';
        ctx.fillText(s.viralSub, tx, footerY + 95);
        ctx.fillStyle = '#3498db'; ctx.fillText('gippp.github.io', tx, footerY + 130);
        
        const link = document.createElement('a'); 
        link.download = `GIPPP_Report_${state.testId}.png`; 
        link.href = canvas.toDataURL('image/png'); 
        link.click();
    };

    return { init, changeLanguage, changeTest, generateImage };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
