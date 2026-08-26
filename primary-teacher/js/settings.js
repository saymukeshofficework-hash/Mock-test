/* Settings: defaults, localStorage persistence, and helpers to read/write them. */
(function () {
  "use strict";

  var STORAGE_KEY = "primaryTeacher.settings.v1";

  var DEFAULTS = {
    hiVoiceURI: "",
    enVoiceURI: "",
    rate: 0.85,
    pitch: 1,
    volume: 1,
    pauseSeconds: 2,
    mode: "auto", // 'auto' | 'manual'
    uiLang: "hi", // 'hi' | 'en'
    lastLessonId: ""
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULTS, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { /* storage unavailable - continue without persistence */ }
  }

  window.Settings = {
    DEFAULTS: DEFAULTS,
    load: load,
    save: save
  };
})();
