/* Lesson engine: drives one item at a time through
   speak -> wait for TTS end -> children's turn -> pause -> next.
   Owns all timers/speech state so nothing ever overlaps or duplicates. */
(function () {
  "use strict";

  var PHASE = { IDLE: "idle", INTRO: "intro", TEACHER: "teacher", CHILDREN: "children", PAUSED: "paused", COMPLETE: "complete" };

  function LessonEngine(tts) {
    this.tts = tts;
    this.lesson = null;
    this.index = 0;
    this.mode = "auto"; // 'auto' | 'manual'
    this.phase = PHASE.IDLE;
    this.pauseMs = 2000;
    this.voiceOptions = {}; // { rate, pitch, volume, hiVoiceURI, enVoiceURI }
    this._pauseTimer = null;
    this._listeners = {};
    this._wasPausedPhase = null;
  }

  LessonEngine.PHASE = PHASE;

  LessonEngine.prototype.on = function (event, cb) {
    (this._listeners[event] = this._listeners[event] || []).push(cb);
    return this;
  };

  LessonEngine.prototype._emit = function (event, data) {
    (this._listeners[event] || []).forEach(function (cb) { cb(data); });
  };

  LessonEngine.prototype._clearTimer = function () {
    if (this._pauseTimer) {
      clearTimeout(this._pauseTimer);
      this._pauseTimer = null;
    }
  };

  LessonEngine.prototype._stopAll = function () {
    this._clearTimer();
    this.tts.stop();
    if (window.AudioPlayer) window.AudioPlayer.stop();
  };

  // Plays pre-generated Piper audio when available, falling back to the Web
  // Speech API (same text) on any playback error so a missing/broken file
  // never stalls a lesson.
  LessonEngine.prototype._speak = function (text, audioUrl, langTag, onend) {
    var self = this;
    var opts = this._speechOptionsFor(langTag);
    opts.onend = onend;
    opts.onerror = onend;

    if (audioUrl && window.AudioPlayer) {
      window.AudioPlayer.play(audioUrl, {
        onend: onend,
        onerror: function () { self.tts.speak(text, opts); }
      });
    } else {
      this.tts.speak(text, opts);
    }
  };

  LessonEngine.prototype.loadLesson = function (lesson, mode) {
    this._stopAll();
    this.lesson = lesson;
    this.index = 0;
    this.mode = mode || this.mode;
    this.phase = PHASE.IDLE;
    this._emit("lessonLoaded", { lesson: lesson });
  };

  LessonEngine.prototype._speechOptionsFor = function (langTag) {
    var isHindi = (langTag || "").toLowerCase().indexOf("hi") === 0;
    return {
      lang: langTag,
      voiceURI: isHindi ? this.voiceOptions.hiVoiceURI : this.voiceOptions.enVoiceURI,
      rate: this.voiceOptions.rate,
      pitch: this.voiceOptions.pitch,
      volume: this.voiceOptions.volume
    };
  };

  LessonEngine.prototype.start = function () {
    if (!this.lesson) return;
    this._stopAll();
    this.index = 0;
    if (this.lesson.introduction) {
      this._playIntro();
    } else {
      this._playItem(0);
    }
  };

  LessonEngine.prototype._playIntro = function () {
    var self = this;
    this.phase = PHASE.INTRO;
    this._emit("phaseChange", { phase: this.phase });
    this._speak(this.lesson.introduction, this.lesson.introAudio, this.lesson.language, function () {
      self._playItem(0);
    });
  };

  LessonEngine.prototype._playItem = function (i) {
    var self = this;
    this._stopAll();
    if (!this.lesson || i < 0 || i >= this.lesson.items.length) return;
    this.index = i;
    this.phase = PHASE.TEACHER;
    var item = this.lesson.items[i];
    this._emit("itemChange", { item: item, index: i, total: this.lesson.items.length });
    this._emit("phaseChange", { phase: this.phase });

    this._speak(item.speech, item.audio, this.lesson.language, function () {
      self._childrenPhase();
    });

    var next = this.lesson.items[i + 1];
    if (next && next.audio && window.AudioPlayer) window.AudioPlayer.preload(next.audio);
  };

  LessonEngine.prototype._childrenPhase = function () {
    var self = this;
    this.phase = PHASE.CHILDREN;
    this._emit("phaseChange", { phase: this.phase });
    if (this.mode === "auto") {
      this._clearTimer();
      this._pauseTimer = setTimeout(function () {
        self._pauseTimer = null;
        self._advance();
      }, this.pauseMs);
    }
  };

  LessonEngine.prototype._advance = function () {
    if (!this.lesson) return;
    if (this.index >= this.lesson.items.length - 1) {
      this._complete();
    } else {
      this._playItem(this.index + 1);
    }
  };

  LessonEngine.prototype._complete = function () {
    this._stopAll();
    this.phase = PHASE.COMPLETE;
    this._emit("phaseChange", { phase: this.phase });
    this._emit("complete", { lesson: this.lesson });
  };

  LessonEngine.prototype.pause = function () {
    if (this.phase === PHASE.COMPLETE || this.phase === PHASE.IDLE) return;
    this._wasPausedPhase = this.phase;
    this._stopAll();
    this.phase = PHASE.PAUSED;
    this._emit("phaseChange", { phase: this.phase });
  };

  LessonEngine.prototype.resume = function () {
    if (this.phase !== PHASE.PAUSED) return;
    this._playItem(this.index);
  };

  LessonEngine.prototype.stop = function () {
    this._stopAll();
    this.phase = PHASE.IDLE;
    this.index = 0;
    this._emit("phaseChange", { phase: this.phase });
    this._emit("stopped", {});
  };

  LessonEngine.prototype.restart = function () {
    this._stopAll();
    this.start();
  };

  LessonEngine.prototype.next = function () {
    if (!this.lesson) return;
    this._stopAll();
    if (this.index >= this.lesson.items.length - 1) {
      this._complete();
    } else {
      this._playItem(this.index + 1);
    }
  };

  LessonEngine.prototype.previous = function () {
    if (!this.lesson) return;
    this._stopAll();
    this._playItem(Math.max(0, this.index - 1));
  };

  LessonEngine.prototype.repeat = function () {
    if (!this.lesson) return;
    this._playItem(this.index);
  };

  LessonEngine.prototype.speakCurrent = function () {
    this.repeat();
  };

  LessonEngine.prototype.setMode = function (mode) {
    this.mode = mode;
    if (this.phase === PHASE.CHILDREN) {
      var self = this;
      this._clearTimer();
      if (mode === "auto") {
        this._pauseTimer = setTimeout(function () {
          self._pauseTimer = null;
          self._advance();
        }, this.pauseMs);
      }
    }
  };

  window.LessonEngine = LessonEngine;
})();
