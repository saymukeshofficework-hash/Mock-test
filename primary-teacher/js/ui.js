/* UI: DOM rendering, bilingual interface strings, and screen management.
   No lesson/engine logic lives here - app.js wires user actions to LessonEngine. */
(function () {
  "use strict";

  var STRINGS = {
    hi: {
      appTitle: "👩‍🏫 Primary Teacher",
      appSubtitle: "बच्चों के लिए डिजिटल कक्षा",
      navSettings: "⚙️ सेटिंग्स",
      navHome: "🏠 मुख्य पृष्ठ",
      categoryCounting: "🔢 गिनती",
      categoryLanguage: "🔤 भाषा",
      categoryBarakhadi: "📝 बारहखड़ी",
      categoryRandom: "🎲 रैंडम अभ्यास",
      itemsCount: "{n} आइटम",
      btnStartShort: "▶ शुरू करें",
      btnPause: "⏸ रोकें",
      btnResume: "▶ जारी रखें",
      btnRestart: "🔄 फिर से शुरू करें",
      btnPrevious: "⏮ पिछला",
      btnNext: "⏭ अगला",
      btnRepeat: "🔊 दोहराएँ",
      btnStop: "⏹ बंद करें",
      btnFullscreen: "⛶ फुलस्क्रीन",
      btnSpeak: "🔊 बोलें",
      modeAuto: "ऑटो",
      modeManual: "मैनुअल",
      modeLabel: "मोड",
      teacherSpeaking: "👩‍🏫 शिक्षक बोल रहे हैं",
      childrenTurn: "👧👦 बच्चों की बारी",
      repeatTogether: "सब मिलकर बोलें",
      nextLabel: "अगला: {x}",
      completionTitle: "🎉 बहुत बढ़िया!",
      completionMessage: "बहुत बढ़िया बच्चों! आपने यह पाठ पूरा कर लिया।",
      completionRestart: "🔄 फिर से शुरू करें",
      completionAnother: "📚 दूसरा पाठ",
      completionHome: "🏠 मुख्य पृष्ठ",
      settingsTitle: "⚙️ सेटिंग्स",
      settingsHindiVoice: "हिंदी आवाज़",
      settingsEnglishVoice: "अंग्रेज़ी आवाज़",
      settingsSpeed: "बोलने की गति",
      settingsPitch: "आवाज़ की पिच",
      settingsVolume: "आवाज़ की मात्रा",
      settingsPause: "बच्चों के बोलने का समय",
      settingsMode: "पाठ मोड",
      settingsUiLang: "इंटरफ़ेस भाषा",
      settingsTestVoice: "🔊 आवाज़ जांचें",
      settingsClose: "बंद करें",
      voiceWarning: "⚠️ देशी हिंदी आवाज़ उपलब्ध नहीं है, फिर भी जारी रखा जा रहा है।",
      testVoiceText: "नमस्ते बच्चों। आज हम पढ़ाई करेंगे।",
      testVoiceTextEn: "Hello children. Today we will study.",
      lessonNotFound: "पाठ नहीं मिला।",
      seconds: "सेकंड"
    },
    en: {
      appTitle: "👩‍🏫 Primary Teacher",
      appSubtitle: "A digital classroom for children",
      navSettings: "⚙️ Settings",
      navHome: "🏠 Home",
      categoryCounting: "🔢 Counting",
      categoryLanguage: "🔤 Language",
      categoryBarakhadi: "📝 Barakhadi",
      categoryRandom: "🎲 Random Practice",
      itemsCount: "{n} items",
      btnStartShort: "▶ Start",
      btnPause: "⏸ Pause",
      btnResume: "▶ Resume",
      btnRestart: "🔄 Restart",
      btnPrevious: "⏮ Previous",
      btnNext: "⏭ Next",
      btnRepeat: "🔊 Repeat",
      btnStop: "⏹ Stop",
      btnFullscreen: "⛶ Fullscreen",
      btnSpeak: "🔊 Speak",
      modeAuto: "Auto",
      modeManual: "Manual",
      modeLabel: "Mode",
      teacherSpeaking: "👩‍🏫 Teacher is speaking",
      childrenTurn: "👧👦 Children's turn",
      repeatTogether: "Everyone repeat together",
      nextLabel: "Next: {x}",
      completionTitle: "🎉 Well done!",
      completionMessage: "Well done, children! You have completed this lesson.",
      completionRestart: "🔄 Restart",
      completionAnother: "📚 Another lesson",
      completionHome: "🏠 Home",
      settingsTitle: "⚙️ Settings",
      settingsHindiVoice: "Hindi voice",
      settingsEnglishVoice: "English voice",
      settingsSpeed: "Speech speed",
      settingsPitch: "Voice pitch",
      settingsVolume: "Volume",
      settingsPause: "Children's pause",
      settingsMode: "Lesson mode",
      settingsUiLang: "Interface language",
      settingsTestVoice: "🔊 Test voice",
      settingsClose: "Close",
      voiceWarning: "⚠️ A native Hindi voice is not available on this device. Continuing anyway.",
      testVoiceText: "नमस्ते बच्चों। आज हम पढ़ाई करेंगे।",
      testVoiceTextEn: "Hello children. Today we will study.",
      lessonNotFound: "Lesson not found.",
      seconds: "sec"
    }
  };

  var uiLang = "hi";
  var els = {};

  function t(key, vars) {
    var str = (STRINGS[uiLang] && STRINGS[uiLang][key]) || STRINGS.hi[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace("{" + k + "}", vars[k]);
      });
    }
    return str;
  }

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    [
      "appTitle", "appSubtitle", "navSettingsBtn", "navHomeBtn",
      "homeScreen", "categoryCountingTitle", "categoryLanguageTitle", "categoryBarakhadiTitle", "categoryRandomTitle",
      "countingGrid", "languageGrid", "barakhadiGrid", "randomGrid",
      "classroomScreen", "classroomTitle", "itemInstruction", "itemDisplay", "itemSpeech",
      "phaseIndicator", "repeatBlock", "repeatTogetherLabel", "repeatTextEl", "progressFill", "progressLabel", "nextPreview",
      "btnStart", "btnPause", "btnResume", "btnRestart", "btnPrevious", "btnNext", "btnRepeat", "btnStop", "btnFullscreenClassroom",
      "modeToggleLabel", "modeToggle",
      "completionOverlay", "completionTitle", "completionMessage", "btnCompletionRestart", "btnCompletionAnother", "btnCompletionHome",
      "settingsPanel", "settingsHindiVoiceLabel", "hiVoiceSelect", "settingsEnglishVoiceLabel", "enVoiceSelect",
      "settingsSpeedLabel", "rateRange", "rateValue",
      "settingsPitchLabel", "pitchRange", "pitchValue",
      "settingsVolumeLabel", "volumeRange", "volumeValue",
      "settingsPauseLabel", "pauseSelect",
      "settingsModeLabel", "modeAutoBtn", "modeManualBtn",
      "settingsUiLangLabel", "uiLangHiBtn", "uiLangEnBtn",
      "btnTestVoice", "voiceWarningEl", "btnSettingsClose",
      "settingsTitleEl"
    ].forEach(function (id) { els[id] = $(id); });
  }

  function setUiLang(lang) {
    uiLang = lang === "en" ? "en" : "hi";
    document.documentElement.lang = uiLang;
    applyStaticStrings();
  }

  function applyStaticStrings() {
    els.appTitle.textContent = t("appTitle");
    els.appSubtitle.textContent = t("appSubtitle");
    els.navSettingsBtn.textContent = t("navSettings");
    els.navHomeBtn.textContent = t("navHome");
    els.categoryCountingTitle.textContent = t("categoryCounting");
    els.categoryLanguageTitle.textContent = t("categoryLanguage");
    els.categoryBarakhadiTitle.textContent = t("categoryBarakhadi");
    els.categoryRandomTitle.textContent = t("categoryRandom");

    els.btnStart.textContent = t("btnStartShort");
    els.btnPause.textContent = t("btnPause");
    els.btnResume.textContent = t("btnResume");
    els.btnRestart.textContent = t("btnRestart");
    els.btnPrevious.textContent = t("btnPrevious");
    els.btnNext.textContent = t("btnNext");
    els.btnRepeat.textContent = t("btnRepeat");
    els.btnStop.textContent = t("btnStop");
    els.btnFullscreenClassroom.textContent = t("btnFullscreen");
    els.repeatTogetherLabel.textContent = t("repeatTogether");
    els.modeToggleLabel.textContent = t("modeLabel") + ":";
    els.modeToggle.textContent = els.modeToggle.dataset.mode === "manual" ? t("modeManual") : t("modeAuto");

    els.completionTitle.textContent = t("completionTitle");
    els.completionMessage.textContent = t("completionMessage");
    els.btnCompletionRestart.textContent = t("completionRestart");
    els.btnCompletionAnother.textContent = t("completionAnother");
    els.btnCompletionHome.textContent = t("completionHome");

    els.settingsTitleEl.textContent = t("settingsTitle");
    els.settingsHindiVoiceLabel.textContent = t("settingsHindiVoice");
    els.settingsEnglishVoiceLabel.textContent = t("settingsEnglishVoice");
    els.settingsSpeedLabel.textContent = t("settingsSpeed");
    els.settingsPitchLabel.textContent = t("settingsPitch");
    els.settingsVolumeLabel.textContent = t("settingsVolume");
    els.settingsPauseLabel.textContent = t("settingsPause");
    els.settingsModeLabel.textContent = t("settingsMode");
    els.modeAutoBtn.textContent = t("modeAuto");
    els.modeManualBtn.textContent = t("modeManual");
    els.settingsUiLangLabel.textContent = t("settingsUiLang");
    els.btnTestVoice.textContent = t("settingsTestVoice");
    els.btnSettingsClose.textContent = t("settingsClose");
  }

  function showScreen(name) {
    els.homeScreen.classList.toggle("hidden", name !== "home");
    els.classroomScreen.classList.toggle("hidden", name !== "classroom");
    if (name === "classroom") document.body.classList.add("classroom-active");
    else document.body.classList.remove("classroom-active");
  }

  function lessonCategoryLabel(lesson) {
    if (lesson.category === "counting") return t("categoryCounting");
    if (lesson.category === "barakhadi") return t("categoryBarakhadi");
    if (lesson.category === "random") return t("categoryRandom");
    return t("categoryLanguage");
  }

  function gridFor(lesson) {
    if (lesson.category === "counting") return els.countingGrid;
    if (lesson.category === "barakhadi") return els.barakhadiGrid;
    if (lesson.category === "random") return els.randomGrid;
    return els.languageGrid;
  }

  function renderHome(lessons, onStart) {
    els.countingGrid.innerHTML = "";
    els.languageGrid.innerHTML = "";
    els.barakhadiGrid.innerHTML = "";
    els.randomGrid.innerHTML = "";
    lessons.forEach(function (lesson) {
      var card = document.createElement("article");
      card.className = "lesson-card";
      card.tabIndex = 0;
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", lesson.title);

      var title = document.createElement("h3");
      title.className = "lesson-card-title";
      title.textContent = lesson.title;

      var desc = document.createElement("p");
      desc.className = "lesson-card-desc";
      desc.textContent = uiLang === "en" && lesson.titleEn ? lesson.titleEn : lesson.title;

      var count = document.createElement("span");
      count.className = "lesson-card-count";
      count.textContent = t("itemsCount", { n: lesson.items.length });

      var btn = document.createElement("button");
      btn.className = "btn btn-start-card";
      btn.textContent = t("btnStartShort");
      btn.setAttribute("aria-label", t("btnStartShort") + " " + lesson.title);
      btn.addEventListener("click", function () { onStart(lesson.id); });

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(count);
      card.appendChild(btn);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onStart(lesson.id); }
      });

      var grid = gridFor(lesson);
      grid.appendChild(card);
    });
  }

  function renderClassroomHeader(lesson) {
    els.classroomTitle.textContent = uiLang === "en" && lesson.titleEn ? lesson.titleEn : lesson.title;
  }

  function renderItem(item, index, total, nextItem) {
    els.itemInstruction.textContent = item.instruction || "";
    els.itemInstruction.classList.toggle("hidden", !item.instruction);
    els.itemDisplay.textContent = item.display;
    els.itemSpeech.textContent = item.speech !== item.display ? item.speech : "";
    els.repeatTextEl.textContent = item.repeatText || item.speech;
    var pct = total ? Math.round(((index + 1) / total) * 100) : 0;
    els.progressFill.style.width = pct + "%";
    els.progressLabel.textContent = (index + 1) + " / " + total;
    if (nextItem) {
      els.nextPreview.textContent = t("nextLabel", { x: nextItem.display });
      els.nextPreview.classList.remove("hidden");
    } else {
      els.nextPreview.textContent = "";
      els.nextPreview.classList.add("hidden");
    }
  }

  function renderIntro(lesson) {
    els.itemInstruction.classList.add("hidden");
    els.itemDisplay.textContent = uiLang === "en" && lesson.titleEn ? lesson.titleEn : lesson.title;
    els.itemSpeech.textContent = "";
    els.repeatTextEl.textContent = "";
    els.progressFill.style.width = "0%";
    els.progressLabel.textContent = "0 / " + lesson.items.length;
    els.nextPreview.classList.add("hidden");
  }

  function renderPhase(phase) {
    els.phaseIndicator.classList.remove("hidden");
    els.repeatBlock.classList.add("hidden");
    els.itemDisplay.classList.remove("pulse");

    if (phase === "teacher" || phase === "intro") {
      els.phaseIndicator.textContent = t("teacherSpeaking");
      els.phaseIndicator.className = "phase-indicator phase-teacher";
    } else if (phase === "children") {
      els.phaseIndicator.textContent = t("childrenTurn");
      els.phaseIndicator.className = "phase-indicator phase-children";
      els.repeatBlock.classList.remove("hidden");
      els.itemDisplay.classList.add("pulse");
    } else if (phase === "paused") {
      els.phaseIndicator.textContent = "⏸";
      els.phaseIndicator.className = "phase-indicator phase-paused";
    } else {
      els.phaseIndicator.classList.add("hidden");
    }
  }

  function setControlsState(state) {
    var running = state.phase === "teacher" || state.phase === "children" || state.phase === "intro";
    var paused = state.phase === "paused";
    var idle = state.phase === "idle" || state.phase === "complete";

    els.btnStart.classList.toggle("hidden", !idle);
    els.btnPause.classList.toggle("hidden", !running);
    els.btnResume.classList.toggle("hidden", !paused);
    els.btnRestart.classList.toggle("hidden", idle);
    els.btnPrevious.disabled = idle;
    els.btnNext.disabled = idle;
    els.btnRepeat.disabled = idle;
    els.btnStop.disabled = idle;
  }

  function showCompletion(show) {
    els.completionOverlay.classList.toggle("hidden", !show);
  }

  function setModeToggle(mode) {
    els.modeToggle.dataset.mode = mode;
    els.modeToggle.textContent = mode === "manual" ? t("modeManual") : t("modeAuto");
  }

  function populateVoiceSelect(select, voices, selectedURI, placeholder) {
    select.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = placeholder;
    select.appendChild(opt0);
    voices.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = v.name + " (" + v.lang + ")";
      if (v.voiceURI === selectedURI) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function toggleFullscreen(targetEl) {
    if (!document.fullscreenElement) {
      (targetEl.requestFullscreen || targetEl.webkitRequestFullscreen || function () {}).call(targetEl);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  }

  window.UI = {
    t: t,
    els: els,
    cacheEls: cacheEls,
    setUiLang: setUiLang,
    applyStaticStrings: applyStaticStrings,
    showScreen: showScreen,
    renderHome: renderHome,
    renderClassroomHeader: renderClassroomHeader,
    renderItem: renderItem,
    renderIntro: renderIntro,
    renderPhase: renderPhase,
    setControlsState: setControlsState,
    showCompletion: showCompletion,
    setModeToggle: setModeToggle,
    populateVoiceSelect: populateVoiceSelect,
    toggleFullscreen: toggleFullscreen,
    getUiLang: function () { return uiLang; }
  };
})();
