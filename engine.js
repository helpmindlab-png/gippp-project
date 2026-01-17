/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v3.3
 * Focus: RTL (Right-to-Left) Support for Arabic, Global Standardization
 */

const GIPPP_ENGINE = (() => {
    let state = { currentIndex: 0, answers: [], questions: [], descriptions: {}, lang: 'en', results: null };

    const uiStrings = {
        ar: { desc: "محلل البصيرة العالمي", security: "🔒 الأمان: لا يتم تخزين البيانات", processing: "جاري التحليل...", wait: "يرجى الانتظار لحظة...", saveImg: "حفظ الصورة", retest: "إعادة الاختبار", reportTitle: "تقرير البصيرة", recommendTitle: "💡 مقترح لك", viewAmazon: "عرض على أمازون", qrNote: "امسح الكود للحفظ", viralTitle: "هل أنت فضولي بشأن بصيرتك؟", viralSub: "امسح الكود للبدء", traits: { E: "الانبساط", A: "المقبولية", C: "الضمير", N: "العصابية", O: "الانفتاح" }, labels: ["أرفض بشدة", "أرفض", "محايد", "أوافق", "أوافق بشدة"] },
        // ... (기존 de, en, es, ja, ko, pt, ru, vi, zh 문자열 유지)
    };

    // (중략: 기존 amazonProducts 및 ui 객체 동일)

    const init = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let userLang = urlParams.get('lang') || navigator.language.substring(0, 2);
        
        if (userLang === 'jp') userLang = 'ja';
        if (userLang === 'vn') userLang = 'vi';
        
        state.lang = uiStrings[userLang] ? userLang : 'en';
        
        // [핵심] RTL 대응: 아랍어일 경우 문서 방향을 오른쪽에서 왼쪽으로 설정
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        document.documentElement.lang = state.lang;

        const s = uiStrings[state.lang];
        ui.brandDesc.innerText = s.desc;
        ui.securityNote.innerText = s.security;
        ui.langSelect.value = state.lang;
        
        await loadData();
        const resData = urlParams.get('res');
        if (resData) decodeAndShowResult(resData); else renderQuestion();
    };

    // (중략: renderQuestion, showProcessing, calculateScores 동일)

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
            const p = d.count === 20 ? d.total : Math.round((data.total / (data.count * 5)) * 100);
            
            // [RTL 대응] 텍스트 및 그래프 방향 반전
            ctx.fillStyle = '#2c3e50'; ctx.font = 'bold 24px sans-serif';
            if (isRTL) {
                ctx.textAlign = 'right'; ctx.fillText(s.traits[t], 540, y);
                ctx.textAlign = 'left'; ctx.fillText(`${p}%`, 60, y);
            } else {
                ctx.textAlign = 'left'; ctx.fillText(s.traits[t], 60, y);
                ctx.textAlign = 'right'; ctx.fillText(`${p}%`, 540, y);
            }
            
            ctx.fillStyle = '#f0f0f0'; ctx.fillRect(60, y + 15, 480, 20);
            if (isRTL) {
                // 오른쪽에서 왼쪽으로 차오르는 그래프
                ctx.fillStyle = '#3498db'; ctx.fillRect(540 - (480 * p / 100), y + 15, (480 * p) / 100, 20);
            } else {
                ctx.fillStyle = '#3498db'; ctx.fillRect(60, y + 15, (480 * p) / 100, 20);
            }
            y += 100;
        });

        // (하단 마케팅 영역도 isRTL에 따라 텍스트 정렬 조정 로직 추가 가능)
        // ... (이하 생략)
    };

    return { init, changeLanguage, generateImage };
})();
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
