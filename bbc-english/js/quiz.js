/* Generic MCQ quiz engine used by Grammar Arena, Word Power, Reading Lab, Free Test. */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffleArray(arr).slice(0, n);
}

function letterFor(index) {
  return String.fromCharCode(65 + index);
}

function createQuiz(opts) {
  const { container, questions, quizType = "grammar", xpPerCorrect = 10, onComplete } = opts;
  let index = 0;
  let score = 0;
  let answered = false;

  function render() {
    if (index >= questions.length) return renderResult();
    const q = questions[index];
    answered = false;
    container.innerHTML = `
      <div class="quiz-progress">
        <span>${index + 1} / ${questions.length}</span>
        <div class="progress-bar"><span style="width:${(index / questions.length) * 100}%"></span></div>
        <span>${score} correct</span>
      </div>
      <div class="card">
        ${q.topic ? `<span class="tag">${q.topic}</span>` : ""}
        <h3 style="margin-top:10px;">${q.question}</h3>
        <div class="option-list" role="group" aria-label="Answer options">
          ${q.options.map((opt, i) => `
            <button class="option-btn" data-i="${i}">
              <span class="letter">${letterFor(i)}</span><span>${opt}</span>
            </button>`).join("")}
        </div>
        <div class="explanation-box" id="quiz-explanation" hidden></div>
        <div class="btn-row" style="margin-top:14px;">
          <button class="btn btn-primary" id="quiz-next" hidden>Next</button>
        </div>
      </div>
    `;
    container.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectOption(btn, q));
    });
    container.querySelector("#quiz-next").addEventListener("click", () => {
      index += 1;
      render();
    });
  }

  function selectOption(btn, q) {
    if (answered) return;
    answered = true;
    const chosen = Number(btn.dataset.i);
    const correct = chosen === q.answerIndex;
    if (correct) score += 1;
    container.querySelectorAll(".option-btn").forEach((b) => {
      b.disabled = true;
      const i = Number(b.dataset.i);
      if (i === q.answerIndex) b.classList.add("correct");
      else if (i === chosen) b.classList.add("incorrect");
    });
    const exp = container.querySelector("#quiz-explanation");
    exp.hidden = false;
    exp.innerHTML = `<strong>${correct ? "Correct! " : "Not quite. "}</strong>${q.explanation}`;
    container.querySelector("#quiz-next").hidden = false;
    if (correct && typeof Gamification !== "undefined") {
      Gamification.addXP(xpPerCorrect, "correct_answer");
    }
  }

  function renderResult() {
    const pct = Math.round((score / questions.length) * 100);
    container.innerHTML = `
      <div class="card" style="text-align:center;">
        <h3>Quiz Complete 🎉</h3>
        <p class="text-muted">You scored</p>
        <div class="num" style="font-size:2.4rem;font-weight:800;color:var(--primary);">${score}/${questions.length}</div>
        <div class="progress-bar" style="margin:16px 0;"><span style="width:${pct}%"></span></div>
        <p>${pct}% correct</p>
        <div id="quiz-result-actions" class="btn-row" style="justify-content:center;"></div>
      </div>
    `;
    if (typeof Progress !== "undefined") {
      Progress.recordQuizScore(quizType, score, questions.length);
    }
    if (typeof onComplete === "function") onComplete({ score, total: questions.length, pct, actionsEl: container.querySelector("#quiz-result-actions") });
  }

  render();
  return { restart: () => { index = 0; score = 0; render(); } };
}
