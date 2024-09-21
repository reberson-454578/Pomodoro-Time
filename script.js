let pomodoroTime = 25 * 60;
let breakTime = 5 * 60;
let longBreakTime = 15 * 60;
let isRunning = false;
let isPaused = false;
let isBreak = false;
let timer;
let startTime;
let remainingTime = pomodoroTime;
let cycles = 0;
let completedCycles = 0;

const motivationalMessages = [
  "Você consegue!",
  "Continue focado!",
  "A cada passo, mais perto do sucesso.",
  "Mantenha a calma e estude.",
  "Sua dedicação vai te levar longe!",
];

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const statusMessage = document.getElementById("status-message");
const motivationalMessage = document.getElementById("motivational-message");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const completedCyclesDisplay = document.getElementById("completed-cycles");
const alertSound = document.getElementById("end-time-audio");
const startAudio = document.getElementById("start-audio");
const pauseAudio = document.getElementById("pause-audio");
const toggleModeButton = document.getElementById("toggle-mode");
const settingsButton = document.getElementById("settings");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.querySelector(".close-modal");
const saveSettingsButton = document.getElementById("save-settings");
const focusInput = document.getElementById("focus-time");
const shortBreakInput = document.getElementById("short-break");
const longBreakInput = document.getElementById("long-break");
const clickSound = document.getElementById("pause-audio");

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function notifyUser(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  }
}

const updateDisplay = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  minutesDisplay.textContent = minutes < 10 ? "0" + minutes : minutes;
  secondsDisplay.textContent = seconds < 10 ? "0" + seconds : seconds;
};

saveSettingsButton.addEventListener("click", () => {
  pomodoroTime = focusInput.value * 60;
  breakTime = shortBreakInput.value * 60;
  longBreakTime = longBreakInput.value * 60;
  remainingTime = pomodoroTime;
  updateDisplay(remainingTime);
  settingsModal.style.display = "none";
});

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

const allButtons = document.querySelectorAll("button");

allButtons.forEach((button) => {
  button.addEventListener("click", playClickSound);
});

function saveRemainingTime() {
  const now = new Date().getTime();
  localStorage.setItem("remainingTime", remainingTime);
  localStorage.setItem("startTime", now);
  localStorage.setItem("isBreak", isBreak);
}

function restoreRemainingTime() {
  const savedTime = localStorage.getItem("remainingTime");
  const savedStart = localStorage.getItem("startTime");
  const savedBreak = localStorage.getItem("isBreak");

  if (savedTime && savedStart) {
    const elapsedTime = Math.floor((new Date().getTime() - savedStart) / 1000);
    remainingTime = savedTime - elapsedTime;
    isBreak = savedBreak === "true";

    if (remainingTime <= 0) {
      remainingTime = 0;
    }

    updateDisplay(remainingTime);
  }
}

const circle = document.querySelector(".progress-ring__circle");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setCircleProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    isPaused = false;
    startTime = new Date().getTime();
    timer = setInterval(() => {
      if (remainingTime <= 0) {
        clearInterval(timer);
        alertSound.play();
        notifyUser(isBreak ? "Intervalo terminado!" : "Foco terminado!");

        if (!isBreak) {
          cycles++;
          completedCycles++;
          completedCyclesDisplay.textContent = completedCycles;

          if (cycles % 4 === 0) {
            statusMessage.textContent = "Hora do intervalo longo!";
            isBreak = true;
            remainingTime = longBreakTime;
          } else {
            statusMessage.textContent = "Hora do intervalo curto!";
            isBreak = true;
            remainingTime = breakTime;
          }
        } else {
          statusMessage.textContent = "De volta ao trabalho!";
          isBreak = false;
          remainingTime = pomodoroTime;
        }

        updateDisplay(remainingTime);
        setCircleProgress(100);
        isRunning = false;
        pauseButton.textContent = "Pausar";
      } else {
        remainingTime--;
        updateDisplay(remainingTime);
        saveRemainingTime();

        const totalTime = isBreak
          ? cycles % 4 === 0
            ? longBreakTime
            : breakTime
          : pomodoroTime;
        const percent = (remainingTime / totalTime) * 100;
        setCircleProgress(percent);
      }
    }, 1000);

    startAudio.play();
    statusMessage.textContent = isBreak ? "Intervalo!" : "Foco!";
    motivationalMessage.textContent =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];
  }
}

window.addEventListener("load", restoreRemainingTime);

pauseButton.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    isPaused = true;
    pauseAudio.play();
    pauseButton.textContent = "Retomar";
    statusMessage.textContent = "Pausado!";
  } else if (isPaused) {
    startTimer();
    pauseButton.textContent = "Pausar";
    statusMessage.textContent = isBreak ? "Intervalo!" : "Foco!";
  }
});

resetButton.addEventListener("click", () => {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  isBreak = false;
  remainingTime = pomodoroTime;
  updateDisplay(remainingTime);
  localStorage.removeItem("remainingTime");
  pauseButton.textContent = "Pausar";
  statusMessage.textContent = "Pronto para começar!";
  completedCyclesDisplay.textContent = completedCycles;
});

settingsButton.addEventListener("click", () => {
  settingsModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target == settingsModal) {
    settingsModal.style.display = "none";
  }
});

toggleModeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const modeText = document.body.classList.contains("light-mode")
    ? "Modo Dark"
    : "Modo Light";

  toggleModeButton.querySelector("span").textContent = modeText;
  toggleModeButton.querySelector(".fa-sun").classList.toggle("active");
  toggleModeButton.querySelector(".fa-moon").classList.toggle("active");
});

startButton.addEventListener("click", () => {
  if (!isRunning && !isPaused) {
    startTimer();
  }
});
