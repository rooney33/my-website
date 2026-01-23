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

// 학습 기록 표시
function displayStudyRecords() {
  const records = getStudyRecords();
  recordsList.innerHTML = '';
  
  if (records.length === 0) {
    recordsList.innerHTML = '<div class="no-records">아직 학습 기록이 없습니다.</div>';
    return;
  }
  
  // 최근 10개만 표시
  records.slice(0, 10).forEach(record => {
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    recordItem.innerHTML = `
      <span class="record-date">${record.date}</span>
      <span class="record-lecture">${record.lecture}</span>
      <span class="record-score">${record.score}점</span>
    `;
    recordsList.appendChild(recordItem);
  });
}

// 학습 기록 가져오기
function getStudyRecords() {
  const records = localStorage.getItem('vocabQuizRecords');
  return records ? JSON.parse(records) : [];
}

// 학습 기록 저장
function saveStudyRecord(lecture, score, maxScore) {
  const records = getStudyRecords();
  const today = new Date().toLocaleDateString('ko-KR');
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
    // 오답일 때는 모달 표시
    allButtons.forEach(btn => {
      if (btn.textContent === selectedOption) {
        btn.classList.add('incorrect');
      }
      if (btn.textContent === question.meaning) {
        btn.classList.add('correct');
      }
    });
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

// 이벤트 리스너는 initVocabQuiz에서 설정됨

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
  document.addEventListener('DOMContentLoaded', initVocabQuiz);
} else {
  initVocabQuiz();
}
