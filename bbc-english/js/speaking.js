/* Speaking Lab widget: timer + optional recording/playback + self-evaluation.
   No real speech/pronunciation analysis is performed — this is deliberate. */
function renderSpeakingWidget(container, item, onDone) {
  let seconds = item.seconds || 30;
  const totalSeconds = seconds;
  let timerId = null;
  let running = false;
  let mediaRecorder = null;
  let chunks = [];
  let audioUrl = null;
  let micSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  container.innerHTML = `
    <div class="card" style="text-align:center;">
      ${item.category ? `<span class="tag">${item.category}</span>` : ""}
      <h3 style="margin-top:10px;">${item.title || ""}</h3>
      <p class="text-muted">${item.prompt}</p>
      ${item.tip ? `<div class="explanation-box" style="text-align:left;"><strong>Tip:</strong> ${item.tip}</div>` : ""}
      <div class="timer-ring" id="sw-timer">${seconds}s</div>
      ${micSupported
        ? `<button class="rec-btn" id="sw-rec" aria-label="Start recording">🎤</button>
           <p class="text-muted" id="sw-rec-status" style="margin-top:10px;font-size:0.85rem;">Tap to record, or just use the timer to practise speaking out loud.</p>
           <audio id="sw-audio" controls style="display:none;margin:14px auto 0;max-width:280px;"></audio>`
        : `<button class="btn btn-primary" id="sw-start">Start Timer</button>
           <p class="text-muted" style="margin-top:10px;font-size:0.85rem;">Recording isn't available on this device/browser — practise speaking out loud with the timer.</p>`
      }
      <div id="sw-eval" style="margin-top:18px;display:none;">
        <p style="font-weight:700;margin-bottom:10px;">How did that feel?</p>
        <div class="btn-row" style="justify-content:center;">
          <button class="btn btn-outline btn-sm" data-eval="confident">😃 Confident</button>
          <button class="btn btn-outline btn-sm" data-eval="okay">🙂 Okay</button>
          <button class="btn btn-outline btn-sm" data-eval="practice">🙁 Need Practice</button>
        </div>
      </div>
    </div>
  `;

  const ring = container.querySelector("#sw-timer");

  function tick() {
    seconds -= 1;
    ring.textContent = seconds + "s";
    if (seconds <= 0) {
      clearInterval(timerId);
      running = false;
      ring.classList.remove("active");
      finishAttempt();
    }
  }

  function startTimer() {
    if (running) return;
    running = true;
    ring.classList.add("active");
    timerId = setInterval(tick, 1000);
  }

  function finishAttempt() {
    container.querySelector("#sw-eval").style.display = "block";
    if (typeof Progress !== "undefined") Progress.markSpeakingPracticed(item.id);
    if (typeof Gamification !== "undefined") Gamification.addXP(30, "speaking_challenge");
  }

  if (micSupported) {
    const recBtn = container.querySelector("#sw-rec");
    const status = container.querySelector("#sw-rec-status");
    const audioEl = container.querySelector("#sw-audio");
    recBtn.addEventListener("click", async () => {
      if (recBtn.classList.contains("recording")) {
        mediaRecorder && mediaRecorder.stop();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          const blob = new Blob(chunks, { type: "audio/webm" });
          audioUrl = URL.createObjectURL(blob);
          audioEl.src = audioUrl;
          audioEl.style.display = "block";
          stream.getTracks().forEach((t) => t.stop());
          recBtn.classList.remove("recording");
          recBtn.textContent = "🎤";
          status.textContent = "Recording saved. Play it back and self-evaluate below.";
          clearInterval(timerId);
          running = false;
          ring.classList.remove("active");
          finishAttempt();
        };
        mediaRecorder.start();
        recBtn.classList.add("recording");
        recBtn.textContent = "⏹";
        status.textContent = "Recording... tap again to stop.";
        seconds = totalSeconds;
        ring.textContent = seconds + "s";
        startTimer();
      } catch (err) {
        status.textContent = "Microphone permission was not granted — use the timer to practise speaking out loud instead.";
        startTimer();
      }
    });
  } else {
    container.querySelector("#sw-start").addEventListener("click", startTimer);
  }

  container.querySelectorAll("[data-eval]").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("[data-eval]").forEach((b) => b.classList.remove("btn-primary"));
      btn.classList.add("btn-primary");
      if (typeof onDone === "function") onDone(btn.dataset.eval);
    });
  });
}
