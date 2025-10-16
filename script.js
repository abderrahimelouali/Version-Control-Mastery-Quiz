import {
  easyQuestions,
  intermediateQuestions,
  hardQuestions,
  expertQuestions,
} from "./questionsdata.js";

// ========================
// DOM ELEMENTS
// ========================
const levelsSection = document.querySelector(".levels-cards");
const quizBox = document.querySelector(".quiz-box");
const levelName = document.querySelector(".level-name");
const questionText = document.querySelector(".question-text");
const choices = document.querySelector(".choices");
const questionNum = document.querySelector(".question-num");
const nextQuestionBtn = document.getElementById("nextQuestion");
const resultBox = document.querySelector(".result-box");
const resultText = document.querySelector(".result-text");
const nextLevelBtn = document.getElementById("nextLevel");
const completeBtn = document.getElementById("completeBtn");
const retryBtn = document.getElementById("retry");
const liveScore = document.getElementById("liveScore");
const homeBtn = document.getElementById("homeBtn");
const mistakesSection = document.querySelector(".mistakes-section");
const mistakesList = document.getElementById("mistakesList");

// ========================
// APP STATE
// ========================
const appState = {
  currentLevel: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  currentScore: 0,
  highScores: { easy: 0, intermediate: 0, hard: 0, expert: 0 },
  userAnswers: [],
};

// ========================
// INITIALIZE HIGH SCORES DISPLAY
// ========================
for (let level in appState.highScores) {
  document.querySelector(`#${level} .high-score span`).textContent =
    appState.highScores[level] + "%";
}

// ========================
// START LEVEL
// ========================
function startLevel(level, questions) {
  levelsSection.style.display = "none";
  quizBox.classList.remove("hidden");
  resultBox.classList.add("hidden");

  appState.currentLevel = level;
  appState.currentQuestions = questions;
  appState.currentQuestionIndex = 0;
  appState.currentScore = 0;
  appState.userAnswers = [];

  renderQuestion();
}

// ========================
// RENDER QUESTION
// ========================
function renderQuestion() {
  choices.innerHTML = "";
  nextQuestionBtn.disabled = true;

  levelName.textContent = appState.currentLevel.toUpperCase();
  const currentQ = appState.currentQuestions[appState.currentQuestionIndex];
  questionText.textContent = currentQ.question;

  // Populate choices
  currentQ.choices.forEach((choice, idx) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = idx;
    input.addEventListener("change", () => {
      nextQuestionBtn.disabled = false;
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + choice));
    choices.appendChild(label);
  });

  questionNum.textContent = `Question ${appState.currentQuestionIndex + 1} of ${
    appState.currentQuestions.length
  }`;

  // Update live score (fixed calculation)
  const scoreCalc = Math.round(
    (appState.currentScore / (appState.currentQuestionIndex || 1)) * 100
  );
  liveScore.textContent = `${scoreCalc}%`;
}

// ========================
// NEXT QUESTION BUTTON
// ========================
nextQuestionBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) return;

  const currentQ = appState.currentQuestions[appState.currentQuestionIndex];
  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === currentQ.correctIndex;

  // Save user answer
  appState.userAnswers.push({
    question: currentQ.question,
    userAnswer: userAnswer,
    correctAnswer: currentQ.correctIndex,
    choices: currentQ.choices,
    isCorrect: isCorrect,
  });

  if (isCorrect) appState.currentScore += 1;

  // Move to next question or show result
  if (appState.currentQuestionIndex < appState.currentQuestions.length - 1) {
    appState.currentQuestionIndex += 1;
    renderQuestion();
  } else {
    displayResult();
  }

  // Update live score after answering
  const scoreCalc = Math.round(
    (appState.currentScore / (appState.currentQuestionIndex + 1)) * 100
  );
  liveScore.textContent = `${scoreCalc}%`;
});

// ========================
// DISPLAY RESULT
// ========================
function displayResult() {
  const scorePercent = Math.round(
    (appState.currentScore / appState.currentQuestions.length) * 100
  );
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  // Update high score if beaten
  if (scorePercent > appState.highScores[appState.currentLevel]) {
    appState.highScores[appState.currentLevel] = scorePercent;
    document.querySelector(
      `#${appState.currentLevel} .high-score span`
    ).textContent = scorePercent + "%";
  }

  // Display mistakes if any
  const mistakes = appState.userAnswers.filter((a) => !a.isCorrect);
  if (mistakes.length > 0) {
    mistakesSection.classList.remove("hidden");
    mistakesList.innerHTML = "";
    mistakes.forEach((mistake) => {
      const item = document.createElement("div");
      item.className = "mistake-item";
      item.innerHTML = `
        <div class="mistake-question">Q: ${mistake.question}</div>
        <div class="mistake-answer wrong">Your answer: ${
          mistake.choices[mistake.userAnswer]
        }</div>
        <div class="mistake-answer correct">Correct answer: ${
          mistake.choices[mistake.correctAnswer]
        }</div>
      `;
      mistakesList.appendChild(item);
    });
  } else {
    mistakesSection.classList.add("hidden");
  }

  // Display appropriate result text and buttons
  if (appState.currentLevel === "expert" && scorePercent >= 80) {
    resultText.textContent = `🏆 You are a Git Legend! Score: ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    nextLevelBtn.classList.add("hidden");
    completeBtn.classList.remove("hidden");
  } else if (scorePercent === 100) {
    resultText.textContent = `Perfect! You got ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    nextLevelBtn.classList.remove("hidden");
    completeBtn.classList.add("hidden");
  } else if (scorePercent >= 80) {
    resultText.textContent = `Well done! You passed with ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    nextLevelBtn.classList.remove("hidden");
    completeBtn.classList.add("hidden");
  } else if (scorePercent >= 50) {
    resultText.textContent = `You're close! You scored ${scorePercent}%`;
    retryBtn.classList.remove("hidden");
    nextLevelBtn.classList.add("hidden");
    completeBtn.classList.add("hidden");
  } else {
    resultText.textContent = `Keep learning! Score: ${scorePercent}%`;
    retryBtn.classList.remove("hidden");
    nextLevelBtn.classList.add("hidden");
    completeBtn.classList.add("hidden");
  }
}

// ========================
// RESET QUIZ
// ========================
function resetQuiz() {
  appState.currentQuestionIndex = 0;
  appState.currentScore = 0;
  appState.userAnswers = [];
}

// ========================
// BUTTON EVENT LISTENERS
// ========================
retryBtn.addEventListener("click", () => {
  resetQuiz();
  startLevel(appState.currentLevel, appState.currentQuestions);
});

nextQuestionBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) return;

  const currentQ = appState.currentQuestions[appState.currentQuestionIndex];
  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === currentQ.correctIndex;

  // ✅ Record the user's answer
  appState.userAnswers.push({
    question: currentQ.question,
    userAnswer,
    correctAnswer: currentQ.correctIndex,
    choices: currentQ.choices,
    isCorrect
  });

  // ✅ Increment score only if correct
  if (isCorrect) appState.currentScore += 1;

  // ✅ Live score: based on TOTAL questions in the current level
  const totalQuestions = appState.currentQuestions.length;
  const live = Math.round((appState.currentScore / totalQuestions) * 100);
  liveScore.textContent = `${live}%`;

  // Move to next question or result
  if (appState.currentQuestionIndex < totalQuestions - 1) {
    appState.currentQuestionIndex += 1;
    renderQuestion();
  } else {
    displayResult();
  }
});


completeBtn.addEventListener("click", () => {
  if (confirm("Congratulations on completing all levels! Return to home?")) {
    window.location.reload();
  }
});

// Level cards click
document
  .getElementById("easy")
  .addEventListener("click", () => startLevel("easy", easyQuestions));
document
  .getElementById("intermediate")
  .addEventListener("click", () =>
    startLevel("intermediate", intermediateQuestions)
  );
document
  .getElementById("hard")
  .addEventListener("click", () => startLevel("hard", hardQuestions));
document
  .getElementById("expert")
  .addEventListener("click", () => startLevel("expert", expertQuestions));

// Home button - smooth navigation
homeBtn.addEventListener("click", () => {
  if (
    !quizBox.classList.contains("hidden") ||
    !resultBox.classList.contains("hidden")
  ) {
    levelsSection.style.display = "grid";
    quizBox.classList.add("hidden");
    resultBox.classList.add("hidden");
    resetQuiz();
  }
});
