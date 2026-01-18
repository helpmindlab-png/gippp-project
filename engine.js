/**
 * GIPPP Core Engine v4.3 (Canvas Rendering & Layout Final Fix)
 * 5대 원칙 준수: Zero-Persistence, Client-Side, Clean-Exit
 */

const GIPPP_ENGINE = (() => {
    let state = {
        testId: 'ocean', lang: 'ko', currentIndex: 0,
        answers: [], questions: [], traitNames: {}, descriptions: {}, results: null
    };

    const uiStrings = {
        ko: { brandDesc: "글로벌 심리 분석 프로파일러", security: "보안 안내: 데이터는 저장되지 않으며 종료 시 즉시 소거됩니다.", loading: "AI가 성향을 분석 중입니다...", restart: "다시 시작하기", download: "리포트 이미지 저장", tests: { ocean: "성격 5요인", loc: "성공 마인드셋", dark: "다크 트라이어드", trust: "사회적 신뢰도", resilience: "회복탄력성" } },
        en: { brandDesc: "Global Psychological Profiler", security: "Security: Data is not stored and is erased immediately.", loading: "AI is analyzing your profile...", restart: "Restart Test", download: "Save Report Image", tests: { ocean: "Big Five", loc: "Success Mindset", dark: "Dark Triad", trust: "Social Trust", resilience: "Resilience" } },
        ja: { brandDesc: "グローバル心理分析", security: "セキュリティ：データは保存されず、終了時に消去されます。", loading: "AIが分析しています...", restart: "最初から", download: "画像を保存", tests: { ocean: "性格5因子", loc: "成功マインド", dark: "ダークトライアド", trust: "社会的信頼", resilience: "回復力" } },
        ar: { brandDesc: "محلل نفسي عالمي", security: "أمان: لا يتم حفظ بياناتك ويتم مسحها فور إغلاق المتصفح.", loading: "AI يقوم بالتحليل...", restart: "إعادة البدء", download: "حفظ التقرير", tests: { ocean: "الشخصية الخمسة", loc: "عقلية النجاح", dark: "الثلاثي المظلم", trust: "الثقة الاجتماعية", resilience: "المرونة" } }
    };

    const init = async () => {
        const params = new URLSearchParams(window.location.search);
        state.testId = params.get('test') || 'ocean';
        state.lang = params.get('lang') || 'ko';
        document.documentElement.lang = state.lang;
        document.documentElement.dir = (state.lang === 'ar') ? 'rtl' : 'ltr';
        updateStaticUI();
        await loadTestData();
        renderQuestion();
    };

    const loadTestData = async () => {
        try {
            const response = await fetch(`./data/${state.testId}/${state.lang}.json`);
            const data = await response.json();
            state.questions = data.items;
            state.traitNames = data.traitNames;
            state.descriptions = data.descriptions;
        } catch (e) { console.error(e); }
    };

    const updateStaticUI = () => {
        const langUI = uiStrings[state.lang] || uiStrings['en'];
        document.getElementById('brand-desc').innerText = langUI.brandDesc;
        document.getElementById('security-note').innerText = langUI.security;
        document.getElementById('lang-select').value = state.lang;
        const testSelect = document.getElementById('test-select');
        testSelect.innerHTML = '';
        Object.keys(langUI.tests).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key; opt.text = langUI.tests[key];
            opt.selected = (key === state.testId);
            testSelect.appendChild(opt);
        });
    };

    const renderQuestion = () => {
        const q = state.questions[state.currentIndex];
        const progress = ((state.currentIndex / state.questions.length) * 100);
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('question-container').innerHTML = `<div id="question-text">${q.text}</div>`;
        const optionsGroup = document.getElementById('options-group');
        optionsGroup.innerHTML = '';
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = getLikertText(score, state.lang);
            btn.onclick = () => handleAnswer(score);
            optionsGroup.appendChild(btn);
        });
    };

    const getLikertText = (score, lang) => {
        const texts = {
            ko: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
            en: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
            ja: ["全く違う", "違う", "普通", "そう思う", "強く思う"],
            ar: ["عارض بشدة", "عارض", "محايد", "وافق", "وافق بشدة"]
        };
        return (texts[lang] || texts['en'])[score - 1];
    };

    const handleAnswer = (score) => {
        const q = state.questions[state.currentIndex];
        state.answers.push({ trait: q.trait, score: (q.direction === '+') ? score : (6 - score) });
        if (state.currentIndex < state.questions.length - 1) {
            state.currentIndex++;
            renderQuestion();
        } else { showProcessing(); }
    };

    const showProcessing = () => {
        const langUI = uiStrings[state.lang] || uiStrings['en'];
        document.getElementById('main-content').innerHTML = `<div class="spinner"></div><p>${langUI.loading}</p>`;
        setTimeout(() => { calculateResults(); }, 2000);
    };

    const calculateResults = () => {
        const totals = {}, counts = {};
        state.answers.forEach(ans => {
            totals[ans.trait] = (totals[ans.trait] || 0) + ans.score;
            counts[ans.trait] = (counts[ans.trait] || 0) + 1;
        });
        state.results = {};
        Object.keys(totals).forEach(trait => { state.results[trait] = totals[trait] / counts[trait]; });
        renderFinalReport();
    };

    const renderFinalReport = () => {
        const langUI = uiStrings[state.lang] || uiStrings['en'];
        document.getElementById('main-content').innerHTML = `
            <div class="result-card">
                <canvas id="resultCanvas" style="width:100%; border-radius:15px; background:#fff;"></canvas>
                <div id="text-results" style="margin-top:20px;"></div>
                <button class="opt-btn" style="background:var(--primary); color:white;" onclick="GIPPP_ENGINE.generateImage()">${langUI.download}</button>
                <button class="opt-btn" onclick="location.reload()">${langUI.restart}</button>
            </div>
        `;
        drawResultCanvas();
        
        let textHtml = "";
        Object.keys(state.results).forEach(trait => {
            const score = state.results[trait];
            const level = score >= 3.5 ? 'high' : 'low';
            textHtml += `<div style="margin-bottom:15px; padding:15px; background:#f8f9fa; border-radius:12px; text-align:left;">
                <strong style="color:var(--primary);">${state.traitNames[trait]}</strong>
                <p style="margin:5px 0 0 0; font-size:0.9rem;">${state.descriptions[trait][level]}</p>
            </div>`;
        });
        document.getElementById('text-results').innerHTML = textHtml;
    };

    const drawResultCanvas = () => {
        const canvas = document.getElementById('resultCanvas');
        const ctx = canvas.getContext('2d');
        const traits = Object.keys(state.results);
        
        canvas.width = 800;
        canvas.height = 200 + (traits.length * 100); // 동적 높이 조절

        // 1. 배경 흰색 칠하기
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. 타이틀
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`GIPPP: ${uiStrings[state.lang].tests[state.testId]}`, 400, 80);

        // 3. 그래프 그리기
        const isRTL = state.lang === 'ar';
        traits.forEach((trait, i) => {
            const score = state.results[trait];
            const y = 180 + (i * 90);
            const barMaxW = 500;
            const barW = (score / 5) * barMaxW;

            // 지표명 (그래프 위쪽 배치)
            ctx.fillStyle = '#34495e';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = isRTL ? 'right' : 'left';
            ctx.fillText(state.traitNames[trait], isRTL ? 750 : 50, y - 15);

            // 배경 바
            ctx.fillStyle = '#f0f2f5';
            ctx.fillRect(isRTL ? 750 - barMaxW : 50, y, barMaxW, 40);

            // 점수 바
            ctx.fillStyle = '#3498db';
            ctx.fillRect(isRTL ? 750 - barW : 50, y, barW, 40);
            
            // 점수 텍스트
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '20px Arial';
            ctx.textAlign = isRTL ? 'left' : 'right';
            ctx.fillText(`${(score * 20).toFixed(0)}%`, isRTL ? 50 : 750, y + 28);
        });

        // 4. 하단 푸터 (QR 및 브랜딩)
        const footerY = canvas.height - 50;
        ctx.fillStyle = '#bdc3c7';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("Scan to test yourself", 50, footerY);
        ctx.textAlign = 'right';
        ctx.fillText("gippp.github.io", 750, footerY);

        // QR 코드 영역 (이미지 로드 없이 직접 그림)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(50, footerY - 110, 80, 80);
        ctx.fillStyle = '#fff'; // QR 내부 패턴 흉내
        ctx.fillRect(60, footerY - 100, 20, 20);
        ctx.fillRect(100, footerY - 100, 20, 20);
        ctx.fillRect(60, footerY - 60, 20, 20);
    };

    return {
        init,
        changeLanguage: (l) => { window.location.href = `?test=${state.testId}&lang=${l}`; },
        changeTest: (t) => { window.location.href = `?test=${t}&lang=${state.lang}`; },
        generateImage: () => {
            const canvas = document.getElementById('resultCanvas');
            const link = document.createElement('a');
            link.download = `GIPPP_Result.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
