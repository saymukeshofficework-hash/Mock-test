/* Plays pre-generated Piper audio files via HTMLAudioElement, with preloading.
   The lesson engine falls back to the Web Speech API (js/tts.js) on any play error,
   so a missing or 404ing file never breaks a lesson. */
(function () {
  "use strict";

  var current = null;
  var preloaded = {}; // url -> Audio element warmed up in advance

  function stop() {
    if (current) {
      current.onended = null;
      current.onerror = null;
      try { current.pause(); } catch (e) { /* ignore */ }
      current = null;
    }
  }

  function play(url, options) {
    options = options || {};
    stop();

    var audio = preloaded[url];
    if (audio) {
      delete preloaded[url];
    } else {
      audio = new Audio(url);
    }
    current = audio;

    audio.onended = function () {
      if (current === audio) current = null;
      if (options.onend) options.onend();
    };
    audio.onerror = function (e) {
      if (current === audio) current = null;
      if (options.onerror) options.onerror(e);
    };

    var playResult = audio.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function (err) {
        if (current === audio) current = null;
        if (options.onerror) options.onerror(err);
      });
    }
  }

  function preload(url) {
    if (!url || preloaded[url]) return;
    var audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    preloaded[url] = audio;
  }

  window.AudioPlayer = { play: play, stop: stop, preload: preload };
})();
