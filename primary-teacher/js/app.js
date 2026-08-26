/* App: wires Settings + TTS + LessonEngine + UI together, handles navigation
   and keyboard shortcuts. */
(function () {
  "use strict";

  var settings = Settings.load();
  var engine = new LessonEngine(TTS);
  var currentLesson = null;

  function lessons() { return window.ALL_LESSONS || []; }
  function findLesson(id) { return lessons().find(function (l) { return l.id === id; }); }

  // Attaches pre-generated Piper audio paths (data/audio-manifest.js) onto the
  // matching lessons/items, when present, before anything renders or plays.
  function applyAudioManifest() {
    var manifest = window.AUDIO_MANIFEST || {};
    lessons().forEach(function (lesson) {
      var entry = manifest[lesson.id];
      if (!entry) return;
      if (entry.intro) lesson.introAudio = entry.intro;
      if (entry.items) {
        lesson.items.forEach(function (item, i) {
          if (entry.items[i]) item.audio = entry.items[i];
        });
      }
    });
  }

  function applyVoiceAndPauseSettings() {
    engine.voiceOptions = {
      rate: settings.rate,
      pitch: settings.pitch,
      volume: settings.volume,
      hiVoiceURI: settings.hiVoiceURI,
      enVoiceURI: settings.enVoiceURI
    };
    engine.pauseMs = settings.pauseSeconds * 1000;
    engine.mode = settings.mode;
  }

  function persist() { Settings.save(settings); }

  /* ---------- Navigation ---------- */

  function goHome() {
    engine.stop();
    currentLesson = null;
    UI.showCompletion(false);
    UI.showScreen("home");
  }

  function startLesson(id) {
    var lesson = findLesson(id);
    if (!lesson) return;
    currentLesson = lesson;
    settings.lastLessonId = id;
    persist();
    UI.showCompletion(false);
    UI.showScreen("classroom");
    UI.renderClassroomHeader(lesson);
    applyVoiceAndPauseSettings();
    engine.loadLesson(lesson, settings.mode);
    UI.renderIntro(lesson);
    UI.setControlsState({ phase: "idle" });
    engine.start();
  }

  /* ---------- Engine events -> UI ---------- */

  engine.on("phaseChange", function (data) {
    UI.renderPhase(data.phase);
    UI.setControlsState({ phase: data.phase });
    if (data.phase === "complete") {
      UI.showCompletion(true);
    }
  });

  engine.on("itemChange", function (data) {
    var next = data.index + 1 < data.total ? currentLesson.items[data.index + 1] : null;
    UI.renderItem(data.item, data.index, data.total, next);
  });

  engine.on("stopped", function () {
    UI.showCompletion(false);
  });

  /* ---------- Controls ---------- */

  function togglePlayPause() {
    if (engine.phase === LessonEngine.PHASE.IDLE || engine.phase === LessonEngine.PHASE.COMPLETE) {
      engine.start();
    } else if (engine.phase === LessonEngine.PHASE.PAUSED) {
      engine.resume();
    } else {
      engine.pause();
    }
  }

  function bindControls() {
    UI.els.btnStart.addEventListener("click", function () { engine.start(); });
    UI.els.btnPause.addEventListener("click", function () { engine.pause(); });
    UI.els.btnResume.addEventListener("click", function () { engine.resume(); });
    UI.els.btnRestart.addEventListener("click", function () { UI.showCompletion(false); engine.restart(); });
    UI.els.btnPrevious.addEventListener("click", function () { engine.previous(); });
    UI.els.btnNext.addEventListener("click", function () { engine.next(); });
    UI.els.btnRepeat.addEventListener("click", function () { engine.repeat(); });
    UI.els.btnStop.addEventListener("click", function () { engine.stop(); UI.renderIntro(currentLesson); UI.setControlsState({ phase: "idle" }); });
    UI.els.btnFullscreenClassroom.addEventListener("click", function () { UI.toggleFullscreen(UI.els.classroomScreen); });
    UI.els.navHomeBtn.addEventListener("click", goHome);

    UI.els.modeToggle.addEventListener("click", function () {
      var newMode = UI.els.modeToggle.dataset.mode === "manual" ? "auto" : "manual";
      settings.mode = newMode;
      persist();
      UI.setModeToggle(newMode);
      engine.setMode(newMode);
    });

    UI.els.btnCompletionRestart.addEventListener("click", function () { UI.showCompletion(false); engine.restart(); });
    UI.els.btnCompletionAnother.addEventListener("click", goHome);
    UI.els.btnCompletionHome.addEventListener("click", goHome);
  }

  /* ---------- Settings panel ---------- */

  function openSettings() {
    UI.els.settingsPanel.classList.remove("hidden");
    refreshVoiceSelects();
  }
  function closeSettings() {
    UI.els.settingsPanel.classList.add("hidden");
  }

  function refreshVoiceSelects() {
    var hiVoices = TTS.getHindiVoices();
    var enVoices = TTS.getEnglishVoices();
    UI.populateVoiceSelect(UI.els.hiVoiceSelect, hiVoices, settings.hiVoiceURI, "— " + (UI.getUiLang() === "en" ? "Auto (best available)" : "स्वतः (सर्वश्रेष्ठ)") + " —");
    UI.populateVoiceSelect(UI.els.enVoiceSelect, enVoices, settings.enVoiceURI, "— " + (UI.getUiLang() === "en" ? "Auto (best available)" : "स्वतः (सर्वश्रेष्ठ)") + " —");

    var hasNativeHindi = hiVoices.some(function (v) { return (v.lang || "").toLowerCase() === "hi-in"; });
    UI.els.voiceWarningEl.classList.toggle("hidden", hasNativeHindi);
    UI.els.voiceWarningEl.textContent = UI.t("voiceWarning");
  }

  function bindSettings() {
    UI.els.navSettingsBtn.addEventListener("click", openSettings);
    UI.els.btnSettingsClose.addEventListener("click", closeSettings);
    UI.els.settingsPanel.addEventListener("click", function (e) {
      if (e.target === UI.els.settingsPanel) closeSettings();
    });

    UI.els.hiVoiceSelect.addEventListener("change", function () {
      settings.hiVoiceURI = UI.els.hiVoiceSelect.value;
      persist();
      applyVoiceAndPauseSettings();
    });
    UI.els.enVoiceSelect.addEventListener("change", function () {
      settings.enVoiceURI = UI.els.enVoiceSelect.value;
      persist();
      applyVoiceAndPauseSettings();
    });

    UI.els.rateRange.addEventListener("input", function () {
      settings.rate = parseFloat(UI.els.rateRange.value);
      UI.els.rateValue.textContent = settings.rate.toFixed(2);
      persist();
      applyVoiceAndPauseSettings();
    });
    UI.els.pitchRange.addEventListener("input", function () {
      settings.pitch = parseFloat(UI.els.pitchRange.value);
      UI.els.pitchValue.textContent = settings.pitch.toFixed(1);
      persist();
      applyVoiceAndPauseSettings();
    });
    UI.els.volumeRange.addEventListener("input", function () {
      settings.volume = parseFloat(UI.els.volumeRange.value);
      UI.els.volumeValue.textContent = Math.round(settings.volume * 100) + "%";
      persist();
      applyVoiceAndPauseSettings();
    });
    UI.els.pauseSelect.addEventListener("change", function () {
      settings.pauseSeconds = parseInt(UI.els.pauseSelect.value, 10);
      persist();
      applyVoiceAndPauseSettings();
    });

    UI.els.modeAutoBtn.addEventListener("click", function () { setModeSetting("auto"); });
    UI.els.modeManualBtn.addEventListener("click", function () { setModeSetting("manual"); });

    UI.els.uiLangHiBtn.addEventListener("click", function () { setUiLangSetting("hi"); });
    UI.els.uiLangEnBtn.addEventListener("click", function () { setUiLangSetting("en"); });

    UI.els.btnTestVoice.addEventListener("click", function () {
      applyVoiceAndPauseSettings();
      TTS.speak(UI.t("testVoiceText"), {
        lang: "hi-IN",
        voiceURI: settings.hiVoiceURI,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume
      });
    });
  }

  function setModeSetting(mode) {
    settings.mode = mode;
    persist();
    UI.setModeToggle(mode);
    UI.els.modeAutoBtn.classList.toggle("active", mode === "auto");
    UI.els.modeManualBtn.classList.toggle("active", mode === "manual");
    engine.setMode(mode);
  }

  function setUiLangSetting(lang) {
    settings.uiLang = lang;
    persist();
    UI.setUiLang(lang);
    UI.els.uiLangHiBtn.classList.toggle("active", lang === "hi");
    UI.els.uiLangEnBtn.classList.toggle("active", lang === "en");
    renderHomeLessons();
    if (currentLesson) UI.renderClassroomHeader(currentLesson);
    refreshVoiceSelects();
  }

  function initSettingsForm() {
    UI.els.rateRange.value = settings.rate;
    UI.els.rateValue.textContent = settings.rate.toFixed(2);
    UI.els.pitchRange.value = settings.pitch;
    UI.els.pitchValue.textContent = settings.pitch.toFixed(1);
    UI.els.volumeRange.value = settings.volume;
    UI.els.volumeValue.textContent = Math.round(settings.volume * 100) + "%";
    UI.els.pauseSelect.value = String(settings.pauseSeconds);
    UI.els.modeAutoBtn.classList.toggle("active", settings.mode === "auto");
    UI.els.modeManualBtn.classList.toggle("active", settings.mode === "manual");
    UI.els.uiLangHiBtn.classList.toggle("active", settings.uiLang === "hi");
    UI.els.uiLangEnBtn.classList.toggle("active", settings.uiLang === "en");
    UI.setModeToggle(settings.mode);
  }

  /* ---------- Keyboard shortcuts ---------- */

  function bindKeyboard() {
    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;
      if (UI.els.classroomScreen.classList.contains("hidden")) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          engine.next();
          break;
        case "ArrowLeft":
          engine.previous();
          break;
        case "r":
        case "R":
          engine.repeat();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            engine.stop();
            UI.renderIntro(currentLesson);
            UI.setControlsState({ phase: "idle" });
          }
          break;
      }
    });
  }

  /* ---------- Home rendering ---------- */

  function renderHomeLessons() {
    UI.renderHome(lessons(), startLesson);
  }

  /* ---------- Init ---------- */

  function init() {
    UI.cacheEls();
    UI.setUiLang(settings.uiLang);
    applyAudioManifest();
    initSettingsForm();
    renderHomeLessons();
    bindControls();
    bindSettings();
    bindKeyboard();
    UI.showScreen("home");

    TTS.onVoicesReady(function () {
      refreshVoiceSelects();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
