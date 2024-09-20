let pomodoroTime = 25 * 60; // 25 minutos padrão
let breakTime = 5 * 60; // 5 minutos de pausa curta padrão
let longBreakTime = 15 * 60; // 15 minutos de pausa longa padrão
let isRunning = false;
let isPaused = false;
let isBreak = false;
let timer;
let remainingTime = pomodoroTime; // Tempo inicial será o do Pomodoro
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

// Função para atualizar o display do tempo (minutos e segundos)
const updateDisplay = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  minutesDisplay.textContent = minutes < 10 ? "0" + minutes : minutes;
  secondsDisplay.textContent = seconds < 10 ? "0" + seconds : seconds;
};

// Atualiza o tempo do display imediatamente após salvar as configurações
saveSettingsButton.addEventListener("click", () => {
  pomodoroTime = focusInput.value * 60;
  breakTime = shortBreakInput.value * 60;
  longBreakTime = longBreakInput.value * 60;
  remainingTime = pomodoroTime; // Atualiza o remainingTime para o novo valor de Pomodoro
  updateDisplay(remainingTime); // Atualiza o display imediatamente
  settingsModal.style.display = "none"; // Fecha o modal
});

// Função para tocar o som de clique e reiniciar se necessário
function playClickSound() {
  clickSound.currentTime = 0; // Reinicia o áudio desde o início
  clickSound.play();
}

// Selecionando todos os botões na página
const allButtons = document.querySelectorAll("button");

// Adicionando o evento de clique a todos os botões para tocar o som
allButtons.forEach((button) => {
  button.addEventListener("click", playClickSound);
});

// Função para atualizar o círculo de progresso
const circle = document.querySelector(".progress-ring__circle");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setCircleProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

// Função para iniciar o timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    isPaused = false;
    timer = setInterval(() => {
      if (remainingTime <= 0) {
        clearInterval(timer);
        alertSound.play();

        if (!isBreak) {
          cycles++;
          completedCycles++;
          completedCyclesDisplay.textContent = completedCycles;

          // Alterna para o intervalo (curto ou longo)
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
          // Alterna de volta para o período de foco
          statusMessage.textContent = "De volta ao trabalho!";
          isBreak = false;
          remainingTime = pomodoroTime;
        }

        updateDisplay(remainingTime); // Atualiza o display ao mudar para intervalo/trabalho
        setCircleProgress(100); // Reinicia o círculo no início do novo período

        // Redefine o estado do temporizador para permitir um novo ciclo
        isRunning = false;
        pauseButton.textContent = "Pausar"; // Reseta o botão de pausa para seu estado original
      } else {
        remainingTime--;
        updateDisplay(remainingTime); // Atualiza o display durante o countdown

        // Atualiza o progresso do círculo
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

// Função para pausar e retomar o timer
pauseButton.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timer); // Pausa o timer
    isRunning = false;
    isPaused = true;
    pauseAudio.play();
    pauseButton.textContent = "Retomar";
    statusMessage.textContent = "Pausado!";
  } else if (isPaused) {
    startTimer(); // Retoma o timer de onde parou
    pauseButton.textContent = "Pausar";
    statusMessage.textContent = isBreak ? "Intervalo!" : "Foco!";
  }
});

// Função para resetar o timer
resetButton.addEventListener("click", () => {
  clearInterval(timer);
  isRunning = false;
  isPaused = false;
  isBreak = false;
  remainingTime = pomodoroTime; // Reseta para o tempo de Pomodoro
  updateDisplay(remainingTime); // Atualiza o display ao resetar
  pauseButton.textContent = "Pausar";
  statusMessage.textContent = "Pronto para começar!";
  completedCyclesDisplay.textContent = completedCycles;
});

// Função para abrir o modal de configurações
settingsButton.addEventListener("click", () => {
  settingsModal.style.display = "block";
});

// Função para fechar o modal de configurações
closeModal.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

// Fecha o modal se clicar fora dele
window.addEventListener("click", (event) => {
  if (event.target == settingsModal) {
    settingsModal.style.display = "none";
  }
});

// Função para alternar entre modos claro e escuro
toggleModeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

// Inicia o timer ao clicar no botão "Iniciar"
startButton.addEventListener("click", () => {
  if (!isRunning && !isPaused) {
    startTimer();
  }
});
