/**
 * [GIPPP] Global Insight Profiler Project - Core Engine v1.4
 * Focus: Standalone Stability, High Readability, Zero-Persistence
 */

const GIPPP_ENGINE = (() => {
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        lang: 'en',
        // 나중에 GA4 가입 후 ID만 넣으면 작동하도록 설계됨
        gaMeasurementId: null 
    };

    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    /**
     * 초기화 및 데이터 로드
     */
    const init = async () => {
        const userLang = navigator.language.substring(0, 2);
        state.lang = (userLang === 'ko') ? 'ko' : 'en';
        
        try {
            // 내부망 환경을 고려하여 fetch 실패 시 기본 문항이라도 띄우도록 예외처리
            const response = await fetch(`./data/questions_${state.lang}.json`);
            if (!response.ok) throw new Error('JSON Load Failed');
            state.questions = await response.json();
            renderQuestion();
        } catch (error) {
            console.error("Data load error:", error);
            ui.questionText.innerText = "데이터 로드 실패. JSON 파일 경로를 확인하세요.";
        }
    };

    /**
     * 질문 렌더링 (가독성 중심)
     */
    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;
        const q = state.questions[state.currentIndex];
        
        ui.questionText.innerHTML = `<span style="font-size: 1.2rem; font-weight: bold;">${q.text}</span>`;
        ui.optionsGroup.innerHTML = '';

        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.style.fontSize = "1.1rem"; // 가독성을 위해 폰트 크기 상향
            btn.innerText = labels[score - 1];
            btn.onclick = () => {
                const finalScore = (q.direction === "-") ? (6 - score) : score;
                state.answers.push({ trait: q.trait, score: finalScore });
                if (++state.currentIndex < state.questions.length) renderQuestion();
                else showResult();
            };
            ui.optionsGroup.appendChild(btn);
        });

        ui.progressFill.style.width = `${(state.currentIndex / state.questions.length) * 100}%`;
    };

    /**
     * 결과 계산 및 출력
     */
    const showResult = () => {
        ui.mainContent.innerHTML = `<div class="processing-view"><h3>${state.lang === 'ko' ? '분석 리포트 생성 중...' : 'Generating Report...'}</h3></div>`;
        
        setTimeout(() => {
            const scores = calculateScores();
            renderFinalReport(scores);
        }, 2000);
    };

    const calculateScores = () => {
        return state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score;
            acc[curr.trait].count += 1;
            return acc;
        }, {});
    };

    const renderFinalReport = (scores) => {
        const traits = {
            E: { ko: "외향성", en: "Extraversion" },
            A: { ko: "친화성", en: "Agreeableness" },
            C: { ko: "성실성", en: "Conscientiousness" },
            N: { ko: "신경증", en: "Neuroticism" },
            O: { ko: "개방성", en: "Openness" }
        };

        let reportHtml = `<div class="result-card"><h2>${state.lang === 'ko' ? '인사이트 리포트' : 'Insight Report'}</h2>`;
        
        let resultDataForDownload = {}; // 마인드-로그용 데이터

        for (const [trait, data] of Object.entries(scores)) {
            const traitName = traits[trait][state.lang];
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            resultDataForDownload[traitName] = percentage + "%";

            reportHtml += `
                <div class="trait-row" style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                        <span>${traitName}</span><span>${percentage}%</span>
                    </div>
                    <div style="width: 100%; height: 12px; background: #eee; border-radius: 6px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: #3498db;"></div>
                    </div>
                </div>`;
        }

        // 마인드-로그 다운로드 버튼 및 종료 버튼
        reportHtml += `
            <div style="margin-top: 25px;">
                <button class="opt-btn" style="background: #2ecc71; color: white; border: none;" onclick="GIPPP_ENGINE.downloadLog(${JSON.stringify(resultDataForDownload)})">
                    ${state.lang === 'ko' ? '결과 파일로 소장하기 (Mind-Log)' : 'Download Mind-Log'}
                </button>
                <button class="exit-btn" style="width: 100%;" onclick="location.reload()">
                    ${state.lang === 'ko' ? '모든 데이터 파기 및 종료' : 'Purge & Exit'}
                </button>
            </div>
            <p style="font-size: 0.8rem; color: #888; margin-top: 15px;">🔒 보안: 본 결과는 서버에 저장되지 않으며 종료 시 즉시 소멸됩니다.</p>
        </div>`;

        ui.mainContent.innerHTML = reportHtml;
    };

    /**
     * 마인드-로그 다운로드 (운영 원칙: 데이터 소유권은 사용자에게)
     */
    const downloadLog = (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GIPPP_Result_${new Date().getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return { init, downloadLog };
})();

document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
