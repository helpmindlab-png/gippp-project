// GIPPP Engine - 단순화 버전
const GIPPP = {
    state: {
        testId: null,
        lang: 'ko',
        currentIndex: 0,
        answers: [],
        data: null
    },

    tests: [
        // 기존 5개 툴
        { id: 'ocean', emoji: '🧬', name: { ko: '나의 본캐 분석', en: 'Big Five Personality' } },
        { id: 'dark', emoji: '🎭', name: { ko: '내 안의 빌런 찾기', en: 'Dark Triad' } },
        { id: 'loc', emoji: '💰', name: { ko: '성공 마인드셋', en: 'Locus of Control' } },
        { id: 'resilience', emoji: '🛡️', name: { ko: '강철 멘탈 테스트', en: 'Resilience Test' } },
        { id: 'trust', emoji: '🤝', name: { ko: '인간관계 온도계', en: 'Social Trust' } },
        
        // 신규 10개 툴
        { id: 'workstyle', emoji: '💼', name: { ko: '업무 스타일 분석', en: 'Work Style Assessment' } },
        { id: 'lovelang', emoji: '💕', name: { ko: '사랑의 언어 테스트', en: 'Love Languages' } },
        { id: 'decision', emoji: '🎯', name: { ko: '의사결정 스타일', en: 'Decision Style' } },
        { id: 'commstyle', emoji: '💬', name: { ko: '소통 유형 테스트', en: 'Communication Style' } },
        { id: 'learnstyle', emoji: '📚', name: { ko: '학습 스타일', en: 'Learning Style' } },
        { id: 'moneymind', emoji: '💸', name: { ko: '금전 태도', en: 'Money Mindset' } },
        { id: 'stressstyle', emoji: '😌', name: { ko: '스트레스 대처', en: 'Stress Coping' } },
        { id: 'timetype', emoji: '⏰', name: { ko: '시간 관리 유형', en: 'Time Management' } },
        { id: 'creativity', emoji: '🎨', name: { ko: '창의성 유형', en: 'Creativity Type' } },
        { id: 'socialstyle', emoji: '🌟', name: { ko: '사교 스타일', en: 'Social Style' } }
    ],

    langs: ['ko', 'en', 'ja', 'zh', 'es', 'ar', 'de', 'pt', 'ru', 'vi'],

    init() {
        console.log('GIPPP 초기화 시작');
        
        // URL 파라미터 확인
        const params = new URLSearchParams(window.location.search);
        this.state.testId = params.get('test');
        this.state.lang = params.get('lang') || 'ko';

        // 언어 선택 드롭다운 설정
        this.setupLangSelect();

        // 테스트 ID가 있으면 테스트 로드, 없으면 메인 화면
        if (this.state.testId) {
            this.loadTest();
        } else {
            this.showWelcome();
        }
    },

    setupLangSelect() {
        const select = document.getElementById('lang-select');
        if (!select) return;

        select.innerHTML = '';
        this.langs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang.toUpperCase();
            if (lang === this.state.lang) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.state.lang = e.target.value;
            if (this.state.testId) {
                this.loadTest();
            } else {
                this.showWelcome();
            }
        });
    },

    showWelcome() {
        console.log('환영 화면 표시');
        document.getElementById('welcome-view').style.display = 'block';
        document.getElementById('test-view').style.display = 'none';

        const grid = document.getElementById('test-grid');
        grid.innerHTML = '';

        this.tests.forEach(test => {
            const card = document.createElement('div');
            card.className = 'test-card';
            card.innerHTML = `
                <span class="emoji">${test.emoji}</span>
                <h3>${test.name[this.state.lang] || test.name.ko}</h3>
            `;
            card.addEventListener('click', () => {
                window.location.href = `?test=${test.id}&lang=${this.state.lang}`;
            });
            grid.appendChild(card);
        });
    },

    async loadTest() {
        console.log(`테스트 로드: ${this.state.testId}, 언어: ${this.state.lang}`);
        
        try {
            const response = await fetch(`data/${this.state.testId}/${this.state.lang}.json`);
            if (!response.ok) throw new Error('파일 로드 실패');
            
            this.state.data = await response.json();
            console.log('데이터 로드 성공', this.state.data);
            
            this.showGuide();
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            alert(`데이터 로드 실패: data/${this.state.testId}/${this.state.lang}.json`);
            this.showWelcome();
        }
    },

    showGuide() {
        document.getElementById('welcome-view').style.display = 'none';
        document.getElementById('test-view').style.display = 'block';
        
        const guideSection = document.getElementById('guide-section');
        const quizSection = document.getElementById('quiz-section');
        const resultSection = document.getElementById('result-section');
        
        guideSection.style.display = 'block';
        quizSection.style.display = 'none';
        resultSection.style.display = 'none';

        document.getElementById('guide-title').textContent = this.state.data.ui.reportTitle || '테스트';
        document.getElementById('guide-purpose').textContent = this.state.data.guide.purpose || '';
        document.getElementById('guide-instruction').textContent = this.state.data.guide.instruction || '';

        const startBtn = document.getElementById('start-btn');
        startBtn.textContent = this.state.data.guide.startBtn || '시작하기';
        startBtn.onclick = () => this.startQuiz();
    },

    startQuiz() {
        this.state.currentIndex = 0;
        this.state.answers = [];

        document.getElementById('guide-section').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';

        this.showQuestion();
    },

    showQuestion() {
        const items = this.state.data.items;
        const current = items[this.state.currentIndex];
        
        // 진행률 업데이트
        const progress = ((this.state.currentIndex + 1) / items.length) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';

        // 질문 표시
        document.getElementById('question-container').innerHTML = `
            <h3>문항 ${this.state.currentIndex + 1} / ${items.length}</h3>
            <p>${current.text}</p>
        `;

        // 옵션 버튼 표시
        const optionsGroup = document.getElementById('options-group');
        optionsGroup.innerHTML = '';

        const labels = this.state.data.ui.labels || ['전혀 아니다', '아니다', '보통이다', '그렇다', '매우 그렇다'];
        
        labels.forEach((label, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = label;
            btn.addEventListener('click', () => this.answerQuestion(index + 1));
            optionsGroup.appendChild(btn);
        });
    },

    answerQuestion(score) {
        const current = this.state.data.items[this.state.currentIndex];
        
        // 역방향 문항 처리
        let finalScore = score;
        if (current.direction === '-') {
            finalScore = 6 - score; // 1->5, 2->4, 3->3, 4->2, 5->1
        }

        this.state.answers.push({
            trait: current.trait,
            score: finalScore
        });

        // 다음 문항 또는 결과
        this.state.currentIndex++;
        if (this.state.currentIndex < this.state.data.items.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    },

    showResults() {
        document.getElementById('quiz-section').style.display = 'none';
        const resultSection = document.getElementById('result-section');
        resultSection.style.display = 'block';

        // 지표별 점수 계산
        const scores = {};
        const counts = {};

        this.state.answers.forEach(answer => {
            if (!scores[answer.trait]) {
                scores[answer.trait] = 0;
                counts[answer.trait] = 0;
            }
            scores[answer.trait] += answer.score;
            counts[answer.trait]++;
        });

        // 평균 계산
        const averages = {};
        for (let trait in scores) {
            averages[trait] = (scores[trait] / counts[trait]).toFixed(1);
        }

        // 결과 HTML 생성
        let html = `<h2>${this.state.data.ui.reportTitle || '결과'}</h2>`;
        
        for (let trait in averages) {
            const traitName = this.state.data.traitNames[trait] || trait;
            const score = averages[trait];
            const percent = (score / 5 * 100).toFixed(0);
            
            const desc = this.state.data.descriptions[trait];
            const description = score >= 3 ? desc.high : desc.low;

            html += `
                <div class="result-item">
                    <h3>${traitName}</h3>
                    <div class="result-bar">
                        <div class="result-fill" style="width: ${percent}%"></div>
                    </div>
                    <p class="result-score">${score} / 5.0</p>
                    <p class="result-desc">${description}</p>
                </div>
            `;
        }

        html += `
            <button class="btn-primary" onclick="location.href='?lang=${this.state.lang}'">
                ${this.state.data.ui.retest || '다시 하기'}
            </button>
        `;

        resultSection.innerHTML = html;
    }
};

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료');
    GIPPP.init();
});

console.log('engine.js 로드 완료');