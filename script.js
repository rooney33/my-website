// 단어 데이터 - Lecture(챕터)별로 구성
const vocaData = [
  {
    "lecture": "Day 1: CS 전공 기초",
    "words": [
      { "word": "Algorithm", "meaning": "알고리즘", "example": "Sorting algorithms are essential for efficient data processing." },
      { "word": "Variable", "meaning": "변수", "example": "Declare a variable using 'let' or 'const'." },
      { "word": "Function", "meaning": "함수", "example": "A function is a reusable block of code." },
      { "word": "Array", "meaning": "배열", "example": "An array stores multiple values in a single variable." },
      { "word": "Object", "meaning": "객체", "example": "Objects are used to store key-value pairs." }
    ]
  },
  {
    "lecture": "Day 2: 토익 빈출 숙어",
    "words": [
      { "word": "abandon", "meaning": "포기하다", "example": "Don't abandon your dreams." },
      { "word": "abundant", "meaning": "풍부한", "example": "The region has abundant natural resources." },
      { "word": "accomplish", "meaning": "성취하다", "example": "We need to accomplish our goals this year." },
      { "word": "accurate", "meaning": "정확한", "example": "Please provide accurate information." },
      { "word": "achieve", "meaning": "달성하다", "example": "She worked hard to achieve success." }
    ]
  },
  {
    "lecture": "Day 3: 비즈니스 영어",
    "words": [
      { "word": "negotiate", "meaning": "협상하다", "example": "We need to negotiate the contract terms." },
      { "word": "deadline", "meaning": "마감일", "example": "The project deadline is next Friday." },
      { "word": "budget", "meaning": "예산", "example": "We must stay within the allocated budget." },
      { "word": "strategy", "meaning": "전략", "example": "A good strategy is crucial for success." },
      { "word": "efficient", "meaning": "효율적인", "example": "This new system is more efficient." }
    ]
  }
];

// 퀴즈 상태 관리
let currentQuestionIndex = 0;
let score = 0;
let shuffledQuestions = [];
let isAnswered = false;
let currentLecture = null;
let timerInterval = null;
let timeLeft = 20;

// DOM 요소 (나중에 초기화)
let lectureSelectionScreen, lectureGrid, recordsList, quizContainer;
let wordCard, wordText, pronounceBtn, optionsContainer;
let scoreDisplay, questionCounter, totalQuestions;
let timerText, timerProgressCircle;
let feedbackModal, modalIcon, modalTitle, modalWord, modalMeaning, modalExample, nextBtn;
let resultScreen, finalScore, maxScore, scorePercentage, restartBtn, backToLecturesBtn;
let backToLectureBtn, themeToggle;
let calendarContainer, selectedDateRecords, dateRecordsList, selectedDateTitle;
let reviewWordsContainer, reviewCount, noReviewWords;

// 네비게이션 기능 초기화
function initNavigation() {
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = link.getAttribute('data-section');
    
    // 활성 링크 업데이트
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // 섹션 표시/숨김
    sections.forEach(section => {
      section.classList.add('hidden');
    });
    
    const targetElement = document.getElementById(targetSection);
    if (targetElement) {
      targetElement.classList.remove('hidden');
        // Vocab Quiz 섹션으로 돌아올 때 챕터 선택 화면 표시
        if (targetSection === 'vocab-quiz') {
          showLectureSelection();
        }
        // Voca Review 섹션으로 갈 때 단어 표시
        if (targetSection === 'voca-review') {
          displayReviewWords();
        }
      }
    });
  });
}

// 챕터 선택 화면 표시
function showLectureSelection() {
  lectureSelectionScreen.classList.remove('hidden');
  quizContainer.classList.add('hidden');
  resultScreen.classList.add('hidden');
  feedbackModal.classList.add('hidden');
  
  // 챕터 카드 생성
  lectureGrid.innerHTML = '';
  vocaData.forEach((lecture, index) => {
    const card = document.createElement('div');
    card.className = 'lecture-card';
    card.innerHTML = `
      <h3>${lecture.lecture}</h3>
      <div class="word-count">${lecture.words.length}개 단어</div>
    `;
    card.addEventListener('click', () => startQuiz(index));
    lectureGrid.appendChild(card);
  });
  
  // 학습 기록 표시
  displayStudyRecords();
}

// 학습 기록 표시 (캘린더 형태)
function displayStudyRecords() {
  const records = getStudyRecords();
  if (!calendarContainer) return;
  
  calendarContainer.innerHTML = '';
  const calendarMonths = document.getElementById('calendar-months');
  if (calendarMonths) {
    calendarMonths.innerHTML = '';
  }
  
  // 최근 1년간의 데이터 생성
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  // 날짜별 단어 개수 집계
  const dateCounts = {};
  records.forEach(record => {
    // 날짜가 이미 ISO 형식이거나, Date 객체로 변환 가능한 형식인지 확인
    let dateKey;
    if (record.date && record.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // 이미 ISO 형식 (YYYY-MM-DD)
      dateKey = record.date;
    } else {
      // 기존 형식 호환성을 위해 Date 객체로 변환 시도
      const date = new Date(record.date);
      if (isNaN(date.getTime())) {
        // 유효하지 않은 날짜는 스킵
        return;
      }
      dateKey = date.toISOString().split('T')[0];
    }
    
    if (!dateCounts[dateKey]) {
      dateCounts[dateKey] = 0;
    }
    // 점수에서 단어 개수 추출 (예: "5/10" -> 5)
    const wordCount = parseInt(record.score.split('/')[0]) || 0;
    dateCounts[dateKey] += wordCount;
  });
  
  // 캘린더 그리드 생성 (53주 x 7일)
  const startDate = new Date(oneYearAgo);
  // 일요일로 맞추기
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  
  // 시작 날짜의 타임스탬프 저장 (변경 방지)
  const startTimestamp = startDate.getTime();
  
  // 월 이름 배열
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // 월별 라벨 위치 계산
  const monthPositions = {};
  
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startTimestamp + (week * 7 + day) * 24 * 60 * 60 * 1000);
      
      if (currentDate > today) continue;
      
      // 과거 1년 이전의 날짜는 표시하지 않음
      if (currentDate < oneYearAgo) continue;
      
      const dateKey = currentDate.toISOString().split('T')[0];
      const count = dateCounts[dateKey] || 0;
      
      // 월 라벨 위치 기록 (각 월의 첫 번째 주)
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const monthKey = `${year}-${month}`;
      if (!monthPositions[monthKey] && currentDate.getDate() <= 7) {
        monthPositions[monthKey] = { week, month };
      }
      
      // 날짜 포맷 (툴팁용)
      const monthNum = currentDate.getMonth() + 1;
      const dayNum = currentDate.getDate();
      const tooltipText = `${monthNum}월 ${dayNum}일 - ${count}개 학습`;
      
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.setAttribute('data-count', Math.min(count, 21)); // 최대 21로 제한
      dayElement.setAttribute('data-date', dateKey);
      dayElement.setAttribute('data-tooltip', tooltipText);
      
      dayElement.addEventListener('click', () => showDateRecords(dateKey, records));
      
      calendarContainer.appendChild(dayElement);
    }
  }
  
  // 월 라벨 생성
  if (calendarMonths) {
    // 주 단위로 간격을 맞추기 위해 빈 라벨 추가
    let lastWeek = -1;
    const sortedMonths = Object.entries(monthPositions).sort((a, b) => a[1].week - b[1].week);
    
    sortedMonths.forEach(([key, value], index) => {
      const monthLabel = document.createElement('span');
      monthLabel.className = 'calendar-month-label';
      monthLabel.textContent = monthNames[value.month];
      
      // 간격 계산 (각 주는 약 14px 너비)
      const gapWeeks = value.week - (lastWeek + 1);
      if (gapWeeks > 0) {
        monthLabel.style.marginLeft = `${gapWeeks * 14}px`;
      }
      lastWeek = value.week;
      
      calendarMonths.appendChild(monthLabel);
    });
  }
}

// 특정 날짜의 기록 표시
function showDateRecords(dateKey, allRecords) {
  if (!selectedDateRecords || !dateRecordsList || !selectedDateTitle) return;
  
  const dateRecords = allRecords.filter(r => {
    // 날짜 형식 확인
    if (r.date && r.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return r.date === dateKey;
    } else {
      const recordDate = new Date(r.date);
      if (isNaN(recordDate.getTime())) {
        return false;
      }
      return recordDate.toISOString().split('T')[0] === dateKey;
    }
  });
  
  if (dateRecords.length === 0) {
    selectedDateRecords.classList.add('hidden');
    return;
  }
  
  selectedDateTitle.textContent = `${dateKey} 학습 기록`;
  dateRecordsList.innerHTML = '';
  
  dateRecords.forEach(record => {
    const item = document.createElement('div');
    item.className = 'date-record-item';
    item.innerHTML = `
      <div class="date-record-lecture">${record.lecture}</div>
      <div class="date-record-score">${record.score}</div>
    `;
    dateRecordsList.appendChild(item);
  });
  
  selectedDateRecords.classList.remove('hidden');
}

// 학습 기록 가져오기
function getStudyRecords() {
  const records = localStorage.getItem('vocabQuizRecords');
  return records ? JSON.parse(records) : [];
}

// 학습 기록 저장
function saveStudyRecord(lecture, score, maxScore) {
  const records = getStudyRecords();
  // ISO 형식으로 날짜 저장 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const percentage = Math.round((score / maxScore) * 100);
  
  records.unshift({
    date: today,
    lecture: lecture,
    score: `${score}/${maxScore} (${percentage}%)`
  });
  
  // 최대 50개까지만 저장
  if (records.length > 50) {
    records.pop();
  }
  
  localStorage.setItem('vocabQuizRecords', JSON.stringify(records));
}

// 틀린 단어 저장
function saveWrongWord(word, meaning, example, lecture) {
  const wrongWords = getWrongWords();
  
  // 이미 존재하는지 확인 (중복 방지)
  const exists = wrongWords.some(w => w.word === word && w.lecture === lecture);
  if (exists) return;
  
  wrongWords.push({
    word: word,
    meaning: meaning,
    example: example,
    lecture: lecture,
    date: new Date().toISOString().split('T')[0]
  });
  
  localStorage.setItem('vocabWrongWords', JSON.stringify(wrongWords));
}

// 틀린 단어 가져오기
function getWrongWords() {
  const words = localStorage.getItem('vocabWrongWords');
  return words ? JSON.parse(words) : [];
}

// 틀린 단어 삭제 (암기 완료)
function removeWrongWord(word, lecture) {
  const wrongWords = getWrongWords();
  const filtered = wrongWords.filter(w => !(w.word === word && w.lecture === lecture));
  localStorage.setItem('vocabWrongWords', JSON.stringify(filtered));
  displayReviewWords();
}

// 퀴즈 시작
function startQuiz(lectureIndex) {
  currentLecture = vocaData[lectureIndex];
  currentQuestionIndex = 0;
  score = 0;
  isAnswered = false;
  
  // 문제 섞기
  shuffledQuestions = [...currentLecture.words].sort(() => Math.random() - 0.5);
  
  // 화면 전환
  lectureSelectionScreen.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  
  // 점수 및 문제 수 업데이트
  updateScore();
  totalQuestions.textContent = shuffledQuestions.length;
  
  loadQuestion();
}

// 문제 로드
function loadQuestion() {
  if (currentQuestionIndex >= shuffledQuestions.length) {
    showResult();
    return;
  }
  
  const question = shuffledQuestions[currentQuestionIndex];
  isAnswered = false;
  
  // 단어 표시
  wordText.textContent = question.word;
  
  // 옵션 생성 (정답 + 오답 3개)
  const allMeanings = vocaData.flatMap(l => l.words.map(w => w.meaning));
  const wrongOptions = allMeanings
    .filter(m => m !== question.meaning)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [question.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
  
  // 옵션 버튼 생성
  optionsContainer.innerHTML = '';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.addEventListener('click', () => selectOption(option, question));
    optionsContainer.appendChild(button);
  });
  
  // 문제 번호 업데이트
  questionCounter.textContent = currentQuestionIndex + 1;
  
  // 타이머 시작
  startTimer();
}

// 타이머 시작
function startTimer() {
  timeLeft = 20;
  timerText.textContent = timeLeft;
  
  // 타이머 원형 진행바 초기화
  const circumference = 2 * Math.PI * 45; // 반지름 45
  timerProgressCircle.style.strokeDasharray = circumference;
  timerProgressCircle.style.strokeDashoffset = 0;
  timerProgressCircle.classList.remove('warning');
  
  // 기존 타이머 정리
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    
    // 진행바 업데이트
    const progress = (20 - timeLeft) / 20;
    const offset = circumference * progress;
    timerProgressCircle.style.strokeDashoffset = offset;
    
    // 5초 이하일 때 경고 색상
    if (timeLeft <= 5) {
      timerProgressCircle.classList.add('warning');
    }
    
    // 시간 종료
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!isAnswered) {
        // 시간 초과 처리 - 오답으로 처리하고 모달 표시
        isAnswered = true;
        const question = shuffledQuestions[currentQuestionIndex];
        const allButtons = optionsContainer.querySelectorAll('.option-btn');
        allButtons.forEach(btn => {
          btn.disabled = true;
          if (btn.textContent === question.meaning) {
            btn.classList.add('correct');
          }
        });
        // 시간 초과도 틀린 단어로 저장
        saveWrongWord(question.word, question.meaning, question.example, currentLecture.lecture);
        showFeedback(false, question);
      }
    }
  }, 1000);
}

// 옵션 선택
function selectOption(selectedOption, question) {
  if (isAnswered) return;
  
  isAnswered = true;
  clearInterval(timerInterval);
  
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  allButtons.forEach(btn => {
    btn.disabled = true;
  });
  
  const isCorrect = selectedOption === question.meaning;
  
  if (isCorrect) {
    // 정답일 때는 버튼 색상만 변경하고 자동으로 다음 문제로
    allButtons.forEach(btn => {
      if (btn.textContent === question.meaning) {
        btn.classList.add('correct');
      }
    });
    score++;
    updateScore();
    
    // 1초 후 자동으로 다음 문제로
    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion();
    }, 1000);
  } else {
    // 오답일 때는 모달 표시 및 틀린 단어 저장
    allButtons.forEach(btn => {
      if (btn.textContent === selectedOption) {
        btn.classList.add('incorrect');
      }
      if (btn.textContent === question.meaning) {
        btn.classList.add('correct');
      }
    });
    // 틀린 단어 저장
    saveWrongWord(question.word, question.meaning, question.example, currentLecture.lecture);
    showFeedback(false, question);
  }
}

// 피드백 모달 표시
function showFeedback(isCorrect, question, selectedOption = null) {
  // 모달 내용 설정
  if (isCorrect) {
    modalIcon.textContent = '✓';
    modalIcon.className = 'modal-icon correct';
    modalTitle.textContent = '정답입니다!';
  } else {
    modalIcon.textContent = '✗';
    modalIcon.className = 'modal-icon incorrect';
    modalTitle.textContent = '오답입니다';
  }
  
  modalWord.textContent = question.word;
  modalMeaning.textContent = question.meaning;
  modalExample.textContent = question.example;
  
  // 모달 표시
  feedbackModal.classList.remove('hidden');
}

// 이벤트 리스너는 initVocabQuiz에서 설정됨

// 점수 업데이트
function updateScore() {
  scoreDisplay.textContent = score;
}

// 결과 화면 표시
function showResult() {
  quizContainer.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  
  const maxScoreValue = shuffledQuestions.length;
  finalScore.textContent = score;
  maxScore.textContent = maxScoreValue;
  
  const percentage = Math.round((score / maxScoreValue) * 100);
  scorePercentage.textContent = `${percentage}%`;
  
  // 결과에 따른 메시지
  let message = '';
  if (percentage >= 90) {
    message = '완벽합니다! 🎉';
  } else if (percentage >= 70) {
    message = '잘하셨습니다! 👍';
  } else if (percentage >= 50) {
    message = '좋은 시도였습니다! 💪';
  } else {
    message = '다시 도전해보세요! 📚';
  }
  
  scorePercentage.innerHTML = `${percentage}%<br><div style="margin-top: 1rem; font-size: 1.3rem; color: var(--accent);">${message}</div>`;
  
  // 학습 기록 저장
  saveStudyRecord(currentLecture.lecture, score, maxScoreValue);
}

// Voca Review 단어 표시
function displayReviewWords() {
  const wrongWords = getWrongWords();
  
  if (!reviewWordsContainer || !reviewCount || !noReviewWords) return;
  
  if (wrongWords.length === 0) {
    reviewWordsContainer.innerHTML = '';
    reviewCount.textContent = '0';
    noReviewWords.classList.remove('hidden');
    return;
  }
  
  noReviewWords.classList.add('hidden');
  reviewCount.textContent = wrongWords.length;
  reviewWordsContainer.innerHTML = '';
  
  wrongWords.forEach((wordData, index) => {
    const card = document.createElement('div');
    card.className = 'review-word-card';
    card.innerHTML = `
      <div class="review-word-header">
        <div>
          <div class="review-word">${wordData.word}</div>
          <div class="review-meaning">${wordData.meaning}</div>
        </div>
      </div>
      <div class="review-example">${wordData.example}</div>
      <div class="review-lecture">출처: ${wordData.lecture}</div>
      <button class="memorized-btn" data-word="${wordData.word}" data-lecture="${wordData.lecture}">
        암기 완료
      </button>
    `;
    
    const memorizedBtn = card.querySelector('.memorized-btn');
    memorizedBtn.addEventListener('click', () => {
      removeWrongWord(wordData.word, wordData.lecture);
    });
    
    reviewWordsContainer.appendChild(card);
  });
}

// 다크모드/라이트모드 토글
function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.contains('light-mode');
  
  if (isLight) {
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  }
}

// 테마 초기화
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
}

// DOM 요소 초기화
function initDOMElements() {
  lectureSelectionScreen = document.getElementById('lecture-selection-screen');
  lectureGrid = document.getElementById('lecture-grid');
  recordsList = document.getElementById('records-list');
  quizContainer = document.getElementById('quiz-container');
  wordCard = document.getElementById('word-card');
  wordText = document.getElementById('word-text');
  pronounceBtn = document.getElementById('pronounce-btn');
  optionsContainer = document.getElementById('options-container');
  scoreDisplay = document.getElementById('score');
  questionCounter = document.getElementById('current-question');
  totalQuestions = document.getElementById('total-questions');
  timerText = document.getElementById('timer-text');
  timerProgressCircle = document.getElementById('timer-progress');
  feedbackModal = document.getElementById('feedback-modal');
  modalIcon = document.getElementById('modal-icon');
  modalTitle = document.getElementById('modal-title');
  modalWord = document.getElementById('modal-word');
  modalMeaning = document.getElementById('modal-meaning');
  modalExample = document.getElementById('modal-example');
  nextBtn = document.getElementById('next-btn');
  resultScreen = document.getElementById('result-screen');
  finalScore = document.getElementById('final-score');
  maxScore = document.getElementById('max-score');
  scorePercentage = document.getElementById('score-percentage');
  restartBtn = document.getElementById('restart-btn');
  backToLecturesBtn = document.getElementById('back-to-lectures-btn');
  backToLectureBtn = document.getElementById('back-to-lecture-btn');
  themeToggle = document.getElementById('theme-toggle');
  calendarContainer = document.getElementById('calendar-container');
  selectedDateRecords = document.getElementById('selected-date-records');
  dateRecordsList = document.getElementById('date-records-list');
  selectedDateTitle = document.getElementById('selected-date-title');
  reviewWordsContainer = document.getElementById('review-words-container');
  reviewCount = document.getElementById('review-count');
  noReviewWords = document.getElementById('no-review-words');
}

// 페이지 로드 시 챕터 선택 화면 표시
function initVocabQuiz() {
  // DOM 요소 초기화
  initDOMElements();
  
  // 네비게이션 초기화
  initNavigation();
  
  // 이벤트 리스너 설정
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (feedbackModal) {
        feedbackModal.classList.add('hidden');
      }
      currentQuestionIndex++;
      loadQuestion();
    });
  }
  
  if (pronounceBtn && wordText) {
    pronounceBtn.addEventListener('click', () => {
      const word = wordText.textContent;
      if (word && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    });
  }
  
  if (restartBtn) {
restartBtn.addEventListener('click', () => {
      if (currentLecture) {
        startQuiz(vocaData.findIndex(l => l.lecture === currentLecture.lecture));
      }
    });
  }
  
  if (backToLecturesBtn) {
    backToLecturesBtn.addEventListener('click', () => {
      showLectureSelection();
    });
  }
  
  if (backToLectureBtn) {
    backToLectureBtn.addEventListener('click', () => {
      if (confirm('진행 중인 퀴즈를 중단하고 챕터 선택으로 돌아가시겠습니까?')) {
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        showLectureSelection();
      }
    });
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // 테마 초기화
  initTheme();
  
  // 초기 상태 설정
  if (lectureSelectionScreen) {
    lectureSelectionScreen.classList.remove('hidden');
  }
  if (quizContainer) {
    quizContainer.classList.add('hidden');
  }
  if (resultScreen) {
    resultScreen.classList.add('hidden');
  }
  if (feedbackModal) {
    feedbackModal.classList.add('hidden');
  }
  
  showLectureSelection();
}

// DOM 로드 완료 시 또는 이미 로드된 경우
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initVocabQuiz();
});
} else {
  initTheme();
  initVocabQuiz();
}
