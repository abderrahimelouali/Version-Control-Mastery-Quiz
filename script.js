// app.js

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
const nextLevelBtn = document.getElementById("nextLevel"); // The missing link!
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
  mistakesSection.classList.add("hidden");

  renderQuestion();
  updateLiveScore();
}

// ========================
// UPDATE LIVE SCORE
// ========================
function updateLiveScore() {
  const totalQuestions = appState.currentQuestions.length;
  const scoreCalc = Math.round((appState.currentScore / totalQuestions) * 100);
  liveScore.textContent = `${scoreCalc}%`;
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
}

// ========================
// DISPLAY RESULT
// ========================
function displayResult() {
  // Calculate final score
  const scorePercent = Math.round(
    (appState.currentScore / appState.currentQuestions.length) * 100
  );

  // Hide quiz and show result box
  quizBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  // Reset button visibility
  retryBtn.classList.remove("hidden");
  nextLevelBtn.classList.add("hidden");
  completeBtn.classList.add("hidden");

  // Update result text and buttons
  if (appState.currentLevel === "expert" && scorePercent >= 80) {
    resultText.textContent = `🏆 You are a Git Legend! Score: ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    completeBtn.classList.remove("hidden");
  } else if (scorePercent === 100) {
    resultText.textContent = `Perfect! You got ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    // Only show next level if NOT expert
    if (appState.currentLevel !== "expert") {
      nextLevelBtn.classList.remove("hidden");
    } else {
      completeBtn.classList.remove("hidden");
    }
  } else if (scorePercent >= 80) {
    resultText.textContent = `Well done! You passed with ${scorePercent}%`;
    retryBtn.classList.add("hidden");
    // Only show next level if NOT expert
    if (appState.currentLevel !== "expert") {
      nextLevelBtn.classList.remove("hidden");
    }
  } else if (scorePercent >= 50) {
    resultText.textContent = `You're close! You scored ${scorePercent}%`;
  } else {
    resultText.textContent = `Keep learning! Score: ${scorePercent}%`;
  }

  // Update high score if beaten
  if (scorePercent > appState.highScores[appState.currentLevel]) {
    appState.highScores[appState.currentLevel] = scorePercent;
    document.querySelector(
      `#${appState.currentLevel} .high-score span`
    ).textContent = scorePercent + "%";
  }

  // Show mistakes if any
  const mistakes = appState.userAnswers.filter((a) => !a.isCorrect);
  if (mistakes.length > 0) {
    mistakesSection.classList.remove("hidden");
    mistakesList.innerHTML = ""; // clear previous

    mistakes.forEach((m) => {
      const item = document.createElement("div");
      item.className = "mistake-item";
      item.innerHTML = `
        <div class="mistake-question">Q: ${m.question}</div>
        <div class="mistake-answer wrong">Your answer: ${
          m.choices[m.userAnswer]
        }</div>
        <div class="mistake-answer correct">Correct answer: ${
          m.choices[m.correctAnswer]
        }</div>
      `;
      mistakesList.appendChild(item);
    });
  } else {
    mistakesSection.classList.add("hidden");
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

// Next Question Button Logic
nextQuestionBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) return;

  const currentQ = appState.currentQuestions[appState.currentQuestionIndex];
  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === currentQ.correctIndex;

  // 1. Update score
  if (isCorrect) appState.currentScore += 1;

  // 2. Save user answer
  appState.userAnswers.push({
    question: currentQ.question,
    userAnswer: userAnswer,
    correctAnswer: currentQ.correctIndex,
    choices: currentQ.choices,
    isCorrect: isCorrect,
  });

  // 3. Update live score
  updateLiveScore();

  // 4. Move to next question or show result
  if (appState.currentQuestionIndex < appState.currentQuestions.length - 1) {
    appState.currentQuestionIndex += 1;
    renderQuestion();
  } else {
    displayResult();
  }
});

retryBtn.addEventListener("click", () => {
  resetQuiz();
  startLevel(appState.currentLevel, appState.currentQuestions);
});

// 🚀 FIX: NEXT LEVEL BUTTON LOGIC ADDED 🚀
nextLevelBtn.addEventListener("click", () => {
  const currentLevel = appState.currentLevel;
  let nextLevelName;
  let nextLevelQuestions;

  // Determine the next level and its questions
  switch (currentLevel) {
    case "easy":
      nextLevelName = "intermediate";
      nextLevelQuestions = intermediateQuestions;
      break;
    case "intermediate":
      nextLevelName = "hard";
      nextLevelQuestions = hardQuestions;
      break;
    case "hard":
      nextLevelName = "expert";
      nextLevelQuestions = expertQuestions;
      break;
    default:
      alert("You have completed all levels! Returning to home.");
      homeBtn.click(); // Trigger the home button logic
      return;
  }

  // Start the next level
  resetQuiz();
  startLevel(nextLevelName, nextLevelQuestions);
});

completeBtn.addEventListener("click", () => {
  if (confirm("Congratulations on completing all levels! Return to home?")) {
    window.location.reload();
  }
});

// Level cards click listeners
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
    mistakesSection.classList.add("hidden");
  }
});
