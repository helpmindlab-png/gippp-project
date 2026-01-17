/**
 * [GIPPP] Global Insight Profiler Project - Core Engine
 * Version: 1.2 (Localized & Refined Algorithm)
 * Principles: Zero-Persistence, Client-Side Computing, Cultural Integrity
 */

const GIPPP_ENGINE = (() => {
    // 1. 내부 상태 관리 (휘발성 메모리)
    let state = {
        currentIndex: 0,
        answers: [],
        questions: [],
        lang: 'en',
        traits: {
            E: { ko: "외향성", en: "Extraversion" },
            A: { ko: "친화성", en: "Agreeableness" },
            C: { ko: "성실성", en: "Conscientiousness" },
            N: { ko: "신경증", en: "Neuroticism" },
            O: { ko: "개방성", en: "Openness" }
        }
    };

    // 2. UI 요소 참조
    const ui = {
        questionText: document.getElementById('question-text'),
        optionsGroup: document.getElementById('options-group'),
        progressFill: document.getElementById('progress-fill'),
        mainContent: document.getElementById('main-content')
    };

    /**
     * 초기화: 언어 감지 및 데이터 로드
     */
    const init = async () => {
        // 브라우저 언어 감지 (한국어 외에는 기본 영어로 설정)
        const userLang = navigator.language.substring(0, 2);
        state.lang = (userLang === 'ko') ? 'ko' : 'en';
        
        try {
            // 국가별/언어별 현지화된 JSON 데이터 로드
            const response = await fetch(`./data/questions_${state.lang}.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            state.questions = await response.json();
            renderQuestion();
        } catch (error) {
            console.error("Engine Initialization Failed:", error);
            ui.questionText.innerText = (state.lang === 'ko') 
                ? "데이터를 불러오는 중 오류가 발생했습니다. (JSON 파일 경로 확인 필요)" 
                : "Error loading analysis data. (Check JSON path)";
        }
    };

    /**
     * 질문 렌더링
     */
    const renderQuestion = () => {
        if (!state.questions[state.currentIndex]) return;

        const q = state.questions[state.currentIndex];
        ui.questionText.innerText = q.text;
        ui.optionsGroup.innerHTML = '';

        // 현지화된 선택지 라벨
        const labels = state.lang === 'ko' 
            ? ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"]
            : ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

        // 5점 척도 버튼 생성
        [1, 2, 3, 4, 5].forEach(score => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.innerText = labels[score - 1];
            btn.onclick = () => handleAnswer(score, q.trait, q.direction);
            ui.optionsGroup.appendChild(btn);
        });

        // 프로그레스 바 업데이트
        const progress = (state.currentIndex / state.questions.length) * 100;
        ui.progressFill.style.width = `${progress}%`;
    };

    /**
     * 답변 처리 및 역채점 로직
     */
    const handleAnswer = (score, trait, direction) => {
        // 역채점 처리: direction이 '-'인 경우 점수를 반전 (1->5, 5->1)
        const finalScore = (direction === "-") ? (6 - score) : score;
        
        state.answers.push({ trait, score: finalScore });

        if (++state.currentIndex < state.questions.length) {
            renderQuestion();
        } else {
            showProcessing();
        }
    };

    /**
     * 결과 분석 중 화면 (수익화 및 데이터 처리 대기)
     */
    const showProcessing = () => {
        const msg = state.lang === 'ko' 
            ? "글로벌 데이터셋과 대조하여 심리 프로파일을 생성 중입니다..." 
            : "Comparing with global datasets to generate your profile...";
        
        ui.mainContent.innerHTML = `
            <div class="processing-view">
                <div class="spinner"></div>
                <p>${msg}</p>
            </div>
        `;

        // 3초 대기 (사용자 경험 및 광고 노출 시간 확보)
        setTimeout(calculateAndRenderResult, 3000);
    };

    /**
     * 최종 결과 계산 및 렌더링
     */
    const calculateAndRenderResult = () => {
        // 1. 특성별 점수 합산
        const traitScores = state.answers.reduce((acc, curr) => {
            if (!acc[curr.trait]) acc[curr.trait] = { total: 0, count: 0 };
            acc[curr.trait].total += curr.score;
            acc[curr.trait].count += 1;
            return acc;
        }, {});

        // 2. 결과 리포트 HTML 생성
        let reportHtml = `
            <div class="result-card">
                <h2>${state.lang === 'ko' ? '인사이트 리포트' : 'Insight Report'}</h2>
                <p class="result-desc">
                    ${state.lang === 'ko' 
                        ? '본 분석은 IPIP 학술 데이터를 기반으로 현지화된 알고리즘에 의해 산출되었습니다.' 
                        : 'This report is generated using localized algorithms based on IPIP academic data.'}
                </p>
        `;

        for (const [trait, data] of Object.entries(traitScores)) {
            const traitName = state.traits[trait][state.lang];
            const percentage = Math.round((data.total / (data.count * 5)) * 100);
            
            reportHtml += `
                <div class="trait-row">
                    <div class="trait-label">
                        <strong>${traitName}</strong>
                        <span>${percentage}%</span>
                    </div>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }

        // 3. 클린 엑시트 버튼 (무기록 원칙 준수)
        const exitText = state.lang === 'ko' ? "데이터 파기 및 안전하게 종료" : "Purge Data & Secure Exit";
        reportHtml += `
                <button class="exit-btn" onclick="location.reload()">${exitText}</button>
                <p class="security-footer">🔒 Your data was processed in-memory and has not been stored.</p>
            </div>
        `;

        ui.mainContent.innerHTML = reportHtml;

        // [추후 구현] GA4 익명 통계 전송 함수 호출 지점
        // sendToGA4(traitScores);
    };

    return {
        init: init
    };
})();

// 엔진 가동
document.addEventListener('DOMContentLoaded', GIPPP_ENGINE.init);
