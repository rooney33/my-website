// 토익 필수 단어 데이터 (영어 단어와 한국어 뜻)
const vocabData = [
  { word: 'abandon', meaning: '포기하다', options: ['포기하다', '수용하다', '승인하다', '거부하다'] },
  { word: 'abundant', meaning: '풍부한', options: ['부족한', '풍부한', '제한된', '희귀한'] },
  { word: 'accomplish', meaning: '성취하다', options: ['실패하다', '시작하다', '성취하다', '지연하다'] },
  { word: 'accurate', meaning: '정확한', options: ['부정확한', '정확한', '모호한', '불완전한'] },
  { word: 'achieve', meaning: '달성하다', options: ['실패하다', '달성하다', '포기하다', '연기하다'] },
  { word: 'acquire', meaning: '획득하다', options: ['잃다', '획득하다', '제거하다', '거부하다'] },
  { word: 'adequate', meaning: '충분한', options: ['부족한', '충분한', '과도한', '제한된'] },
  { word: 'adjacent', meaning: '인접한', options: ['먼', '인접한', '대립하는', '동일한'] },
  { word: 'adjust', meaning: '조정하다', options: ['고정하다', '조정하다', '파괴하다', '무시하다'] },
  { word: 'admit', meaning: '인정하다', options: ['부인하다', '인정하다', '거부하다', '회피하다'] }
];

// 퀴즈 상태 관리
let currentQuestionIndex = 0;
let score = 0;
let shuffledQuestions = [];
let isAnswered = false;

// DOM 요소
const wordCard = document.getElementById('word-card');
const wordText = document.getElementById('word-text');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score');
const questionCounter = document.getElementById('current-question');
const feedbackMessage = document.getElementById('feedback-message');
const resultScreen = document.getElementById('result-screen');
const finalScore = document.getElementById('final-score');
const scorePercentage = document.getElementById('score-percentage');
const restartBtn = document.getElementById('restart-btn');

// 네비게이션 기능
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
    }
  });
});

// 퀴즈 초기화
function initQuiz() {
  // 문제 섞기
  shuffledQuestions = [...vocabData].sort(() => Math.random() - 0.5);
  currentQuestionIndex = 0;
  score = 0;
  isAnswered = false;
  
  // 결과 화면 숨기기
  resultScreen.classList.add('hidden');
  
  // 퀴즈 컨테이너 표시
  document.querySelector('.quiz-container').style.display = 'block';
  
  updateScore();
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
  
  // 단어 카드 애니메이션
  wordCard.classList.remove('slide-out', 'slide-in');
  setTimeout(() => {
    wordCard.classList.add('slide-in');
  }, 10);
  
  // 단어 표시
  wordText.textContent = question.word;
  
  // 옵션 섞기
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
  
  // 옵션 버튼 생성
  optionsContainer.innerHTML = '';
  shuffledOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.addEventListener('click', () => selectOption(option, question.meaning, button));
    optionsContainer.appendChild(button);
  });
  
  // 피드백 메시지 초기화
  feedbackMessage.textContent = '';
  feedbackMessage.className = 'feedback-message';
  
  // 문제 번호 업데이트
  questionCounter.textContent = currentQuestionIndex + 1;
}

// 옵션 선택
function selectOption(selectedOption, correctAnswer, buttonElement) {
  if (isAnswered) return;
  
  isAnswered = true;
  const allButtons = optionsContainer.querySelectorAll('.option-btn');
  
  // 모든 버튼 비활성화
  allButtons.forEach(btn => {
    btn.disabled = true;
  });
  
  // 정답 확인
  if (selectedOption === correctAnswer) {
    // 정답
    buttonElement.classList.add('correct');
    score += 10;
    updateScore();
    feedbackMessage.textContent = '정답입니다! ✓';
    feedbackMessage.classList.add('correct');
    
    // 다음 문제로 이동
    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion();
    }, 1500);
  } else {
    // 오답
    buttonElement.classList.add('incorrect');
    
    // 정답 버튼 찾아서 표시
    allButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('correct');
      }
    });
    
    feedbackMessage.textContent = `오답입니다. 정답: ${correctAnswer}`;
    feedbackMessage.classList.add('incorrect');
    
    // 다음 문제로 이동
    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion();
    }, 2000);
  }
}

// 점수 업데이트
function updateScore() {
  scoreDisplay.textContent = score;
}

// 결과 화면 표시
function showResult() {
  document.querySelector('.quiz-container').style.display = 'none';
  resultScreen.classList.remove('hidden');
  
  finalScore.textContent = score;
  const percentage = (score / 100) * 100;
  scorePercentage.textContent = `${percentage}%`;
  
  // 결과에 따른 메시지 추가
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
  
  if (!scorePercentage.querySelector('.result-message')) {
    const messageEl = document.createElement('div');
    messageEl.className = 'result-message';
    messageEl.style.marginTop = '1rem';
    messageEl.style.fontSize = '1.3rem';
    messageEl.style.color = 'var(--accent)';
    messageEl.textContent = message;
    scorePercentage.appendChild(messageEl);
  }
}

// 다시 시작 버튼
restartBtn.addEventListener('click', () => {
  initQuiz();
});

// 페이지 로드 시 퀴즈 시작
document.addEventListener('DOMContentLoaded', () => {
  initQuiz();
});
