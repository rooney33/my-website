// Focus Timer 기능
// 목표 시간은 날짜별로 localStorage에 저장됨

// 포춘쿠키 응원 문구 배열
const fortuneMessages = [
  "오늘도 화이팅! 💪",
  "작은 발걸음이 큰 변화를 만듭니다. 🌱",
  "지금 이 순간이 가장 중요합니다. ⏰",
  "포기하지 않으면 반드시 성공합니다. 🎯",
  "오늘의 노력이 내일의 나를 만듭니다. 🌟",
  "한 걸음씩 꾸준히 가면 목표에 도달합니다. 🚶",
  "공부는 투자입니다. 지금 투자하세요! 💰",
  "성공은 준비된 자에게 찾아옵니다. 📚",
  "오늘 하루도 최선을 다해봅시다! ✨",
  "작은 실천이 큰 성취를 만듭니다. 🎨",
  "지금 시작하는 것이 가장 빠릅니다. 🏃",
  "포기하지 마세요. 당신은 할 수 있습니다! 💫",
];

// 타이머 상태
let timerState = {
  mode: "focus", // "focus" or "rest"
  time: 25 * 60, // 초 단위 (기본 25분)
  restTime: 5 * 60, // 초 단위 (기본 5분)
  isRunning: false,
  interval: null,
  startTime: null, // 세션 시작 시간
  initialTime: 25 * 60, // 세션 시작 시 초기 시간
};

// DOM 요소
let focusModeBtn, restModeBtn;
let timerTime, timerLabel;
let startBtn, pauseBtn, stopBtn;
let fortuneText, newFortuneBtn;
let todayTime, calendarGrid;
let studyModal, studyInput, saveStudyBtn, skipStudyBtn;
let goalTimeInput, saveGoalBtn, goalDisplay;

// 초기화
function initTimer() {
  // DOM 요소 가져오기
  focusModeBtn = document.getElementById("focus-mode-btn");
  restModeBtn = document.getElementById("rest-mode-btn");
  timerTime = document.getElementById("timer-time");
  timerLabel = document.getElementById("timer-label");
  startBtn = document.getElementById("start-btn");
  pauseBtn = document.getElementById("pause-btn");
  stopBtn = document.getElementById("stop-btn");
  fortuneText = document.getElementById("fortune-text");
  newFortuneBtn = document.getElementById("new-fortune-btn");
  todayTime = document.getElementById("today-time");
  calendarGrid = document.getElementById("calendar-grid");
  studyModal = document.getElementById("study-modal");
  studyInput = document.getElementById("study-input");
  saveStudyBtn = document.getElementById("save-study-btn");
  skipStudyBtn = document.getElementById("skip-study-btn");
  goalTimeInput = document.getElementById("goal-time-input");
  saveGoalBtn = document.getElementById("save-goal-btn");
  goalDisplay = document.getElementById("goal-display");

  // 이벤트 리스너 설정
  if (focusModeBtn) {
    focusModeBtn.addEventListener("click", () => switchMode("focus"));
  }
  if (restModeBtn) {
    restModeBtn.addEventListener("click", () => switchMode("rest"));
  }
  if (startBtn) {
    startBtn.addEventListener("click", startTimer);
  }
  if (pauseBtn) {
    pauseBtn.addEventListener("click", pauseTimer);
  }
  if (stopBtn) {
    stopBtn.addEventListener("click", stopTimer);
  }
  if (newFortuneBtn) {
    newFortuneBtn.addEventListener("click", showNewFortune);
  }
  if (saveStudyBtn) {
    saveStudyBtn.addEventListener("click", saveStudySession);
  }
  if (skipStudyBtn) {
    skipStudyBtn.addEventListener("click", skipStudySession);
  }
  if (saveGoalBtn) {
    saveGoalBtn.addEventListener("click", saveGoalTime);
  }
  if (goalTimeInput) {
    goalTimeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveGoalTime();
      }
    });
  }

  // 초기 상태 설정
  updateTimerDisplay();
  showNewFortune();
  loadTodayGoal();
  updateTodayStats();
  generateCalendar();
}

// 모드 전환
function switchMode(mode) {
  if (timerState.isRunning) {
    if (!confirm("타이머가 실행 중입니다. 정지하고 모드를 변경하시겠습니까?")) {
      return;
    }
    stopTimer();
  }

  timerState.mode = mode;
  focusModeBtn.classList.toggle("active", mode === "focus");
  restModeBtn.classList.toggle("active", mode === "rest");

  if (mode === "focus") {
    timerState.time = 25 * 60;
    timerLabel.textContent = "집중 시간";
  } else {
    timerState.time = timerState.restTime;
    timerLabel.textContent = "휴식 시간";
  }

  updateTimerDisplay();
}

// 타이머 시작
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.startTime = Date.now();
  timerState.initialTime = timerState.time;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;

  timerState.interval = setInterval(() => {
    timerState.time--;
    updateTimerDisplay();

    if (timerState.time <= 0) {
      clearInterval(timerState.interval);
      timerState.isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;

      // 집중 모드가 끝났을 때만 공부 내용 입력 모달 표시
      if (timerState.mode === "focus") {
        showStudyModal();
      } else {
        // 휴식 모드가 끝나면 알림만 표시
        alert("휴식 시간이 끝났습니다! 다시 집중 모드로 시작하세요.");
        switchMode("focus");
      }
    }
  }, 1000);
}

// 타이머 일시정지
function pauseTimer() {
  if (!timerState.isRunning) return;

  clearInterval(timerState.interval);
  timerState.isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// 타이머 정지
function stopTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;

  // 초기 시간으로 리셋
  if (timerState.mode === "focus") {
    timerState.time = 25 * 60;
  } else {
    timerState.time = timerState.restTime;
  }

  updateTimerDisplay();
}

// 타이머 표시 업데이트
function updateTimerDisplay() {
  const minutes = Math.floor(timerState.time / 60);
  const seconds = timerState.time % 60;
  timerTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// 포춘쿠키 표시
function showNewFortune() {
  const randomIndex = Math.floor(Math.random() * fortuneMessages.length);
  fortuneText.textContent = fortuneMessages[randomIndex];
}

// 공부 내용 입력 모달 표시
function showStudyModal() {
  if (studyModal) {
    studyModal.classList.remove("hidden");
    if (studyInput) {
      studyInput.value = "";
      studyInput.focus();
    }
  }
}

// 공부 세션 저장
function saveStudySession() {
  const studyContent = studyInput ? studyInput.value.trim() : "";
  const today = new Date().toISOString().split("T")[0];
  
  // 실제 완료된 시간 계산 (초기 시간 - 남은 시간)
  const completedMinutes = Math.floor((timerState.initialTime - timerState.time) / 60);

  // localStorage에서 데이터 가져오기
  const studyData = JSON.parse(localStorage.getItem("focusTimerData") || "{}");

  if (!studyData[today]) {
    studyData[today] = { totalMinutes: 0, sessions: [] };
  }

  // 시간 추가 (최소 1분 이상일 때만 저장)
  if (completedMinutes > 0) {
    studyData[today].totalMinutes += completedMinutes;
    studyData[today].sessions.push({
      time: completedMinutes,
      content: studyContent || "내용 없음",
      timestamp: new Date().toISOString(),
    });

    // localStorage에 저장
    localStorage.setItem("focusTimerData", JSON.stringify(studyData));
  }

  // 모달 닫기
  if (studyModal) {
    studyModal.classList.add("hidden");
  }

  // 통계 업데이트
  updateTodayStats();
  generateCalendar();

  // 다음 집중 모드로 전환
  switchMode("focus");
}

// 공부 세션 건너뛰기
function skipStudySession() {
  if (studyModal) {
    studyModal.classList.add("hidden");
  }
  switchMode("focus");
}

// 오늘의 목표 시간 불러오기
function loadTodayGoal() {
  const today = new Date().toISOString().split("T")[0];
  const goalData = JSON.parse(localStorage.getItem("focusTimerGoals") || "{}");
  const todayGoal = goalData[today] || 6; // 기본값 6시간

  if (goalTimeInput) {
    goalTimeInput.value = todayGoal;
  }
  updateGoalDisplay(todayGoal);
}

// 목표 시간 저장
function saveGoalTime() {
  const goalTime = parseFloat(goalTimeInput ? goalTimeInput.value : 6);
  
  if (isNaN(goalTime) || goalTime <= 0) {
    alert("올바른 목표 시간을 입력해주세요. (0.5시간 이상)");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const goalData = JSON.parse(localStorage.getItem("focusTimerGoals") || "{}");
  goalData[today] = goalTime;
  localStorage.setItem("focusTimerGoals", JSON.stringify(goalData));

  updateGoalDisplay(goalTime);
  generateCalendar(); // 캘린더 다시 생성하여 이모티콘 업데이트
  
  alert(`✅ 오늘의 목표 시간이 ${goalTime}시간으로 설정되었습니다!`);
}

// 목표 시간 표시 업데이트
function updateGoalDisplay(goalTime) {
  if (goalDisplay) {
    goalDisplay.textContent = `목표: ${goalTime}시간`;
  }
}

// 오늘의 목표 시간 가져오기
function getTodayGoal() {
  const today = new Date().toISOString().split("T")[0];
  const goalData = JSON.parse(localStorage.getItem("focusTimerGoals") || "{}");
  return goalData[today] || 6; // 기본값 6시간
}

// 오늘의 통계 업데이트
function updateTodayStats() {
  const today = new Date().toISOString().split("T")[0];
  const studyData = JSON.parse(localStorage.getItem("focusTimerData") || "{}");

  if (studyData[today]) {
    const totalMinutes = studyData[today].totalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    todayTime.textContent = `${hours}시간 ${minutes}분`;
  } else {
    todayTime.textContent = "0시간 0분";
  }
}

// 캘린더 생성
function generateCalendar() {
  if (!calendarGrid) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  calendarGrid.innerHTML = "";

  // 요일 헤더
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  weekdays.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-weekday";
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });

  // 빈 칸 (첫 주의 시작일 이전)
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarGrid.appendChild(emptyCell);
  }

  // 날짜 셀
  const studyData = JSON.parse(localStorage.getItem("focusTimerData") || "{}");
  const goalData = JSON.parse(localStorage.getItem("focusTimerGoals") || "{}");

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayData = studyData[dateStr];
    const totalHours = dayData ? dayData.totalMinutes / 60 : 0;
    const dayGoal = goalData[dateStr] || 6; // 해당 날짜의 목표 시간 (기본값 6시간)

    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    dayCell.textContent = day;

    // 오늘 날짜 강조
    if (dateStr === today.toISOString().split("T")[0]) {
      dayCell.classList.add("today");
    }

    // 이모티콘 표시 (목표 시간 대비 비율)
    let emoji = "";
    if (totalHours > 0) {
      const percentage = (totalHours / dayGoal) * 100;
      
      if (percentage >= 80) {
        emoji = "😄";
        dayCell.classList.add("goal-achieved");
      } else if (percentage >= 50) {
        emoji = "🍀";
        dayCell.classList.add("moderate");
      } else {
        emoji = "💧";
        dayCell.classList.add("low");
      }

      const emojiSpan = document.createElement("span");
      emojiSpan.className = "day-emoji";
      emojiSpan.textContent = emoji;
      dayCell.appendChild(emojiSpan);
    }

    calendarGrid.appendChild(dayCell);
  }
}

// 페이지 로드 시 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTimer);
} else {
  initTimer();
}
