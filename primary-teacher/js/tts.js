/* Text-to-speech engine: voice discovery, ranking, and speech playback.
   Wraps window.speechSynthesis so the rest of the app never has to think about
   browser quirks (async voice loading, cancel-before-speak, etc). */
(function () {
  "use strict";

  var synth = window.speechSynthesis;
  var voices = [];
  var voicesReady = false;
  var voicesReadyCallbacks = [];
  var currentUtterance = null;

  function loadVoices() {
    if (!synth) return;
    var v = synth.getVoices();
    if (v && v.length) {
      voices = v;
      if (!voicesReady) {
        voicesReady = true;
        voicesReadyCallbacks.forEach(function (cb) { cb(voices); });
        voicesReadyCallbacks = [];
      }
    }
  }

  function onVoicesReady(cb) {
    if (voicesReady && voices.length) { cb(voices); return; }
    voicesReadyCallbacks.push(cb);
  }

  if (synth) {
    loadVoices();
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = loadVoices;
    }
    // Fallback: some browsers never fire onvoiceschanged reliably.
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      loadVoices();
      if (voicesReady || attempts > 20) clearInterval(poll);
    }, 250);
  }

  function scoreVoice(voice, langPrefix) {
    var lang = (voice.lang || "").toLowerCase();
    var name = (voice.name || "").toLowerCase();
    if (langPrefix === "hi") {
      if (lang === "hi-in") return 100;
      if (lang.indexOf("hi") === 0) return 80;
      if (name.indexOf("hindi") !== -1) return 70;
      return -1;
    }
    // English
    if (lang === "en-in") return 100;
    if (name.indexOf("india") !== -1 && lang.indexOf("en") === 0) return 90;
    if (lang.indexOf("en") === 0) return 60;
    return -1;
  }

  function rankedVoices(langPrefix) {
    return voices
      .map(function (v) { return { voice: v, score: scoreVoice(v, langPrefix) }; })
      .filter(function (v) { return v.score > -1; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (v) { return v.voice; });
  }

  function bestVoice(langPrefix, preferredURI) {
    if (preferredURI) {
      var match = voices.find(function (v) { return v.voiceURI === preferredURI; });
      if (match) return match;
    }
    var ranked = rankedVoices(langPrefix);
    return ranked.length ? ranked[0] : null;
  }

  function langPrefixFromTag(langTag) {
    return (langTag || "").toLowerCase().indexOf("hi") === 0 ? "hi" : "en";
  }

  function stop() {
    if (!synth) return;
    try { synth.cancel(); } catch (e) { /* ignore */ }
    currentUtterance = null;
  }

  /**
   * speak(text, { lang, voiceURI, rate, pitch, volume, onend, onerror, onstart })
   * Always cancels any in-flight speech first so utterances never overlap.
   */
  function speak(text, options) {
    options = options || {};
    if (!synth) {
      if (options.onerror) options.onerror(new Error("speechSynthesis unavailable"));
      return;
    }
    stop();

    var langPrefix = langPrefixFromTag(options.lang);
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = options.lang || (langPrefix === "hi" ? "hi-IN" : "en-IN");
    var voice = bestVoice(langPrefix, options.voiceURI);
    if (voice) utter.voice = voice;
    utter.rate = typeof options.rate === "number" ? options.rate : (langPrefix === "hi" ? 0.85 : 0.9);
    utter.pitch = typeof options.pitch === "number" ? options.pitch : 1;
    utter.volume = typeof options.volume === "number" ? options.volume : 1;

    utter.onstart = function () { if (options.onstart) options.onstart(); };
    utter.onend = function () {
      if (currentUtterance === utter) currentUtterance = null;
      if (options.onend) options.onend();
    };
    utter.onerror = function (e) {
      if (currentUtterance === utter) currentUtterance = null;
      if (options.onerror) options.onerror(e);
    };

    currentUtterance = utter;
    // Some browsers (esp. Chrome) silently drop speak() calls made too soon
    // after cancel(); a micro-delay makes playback reliable.
    setTimeout(function () {
      if (currentUtterance === utter) synth.speak(utter);
    }, 30);
  }

  window.TTS = {
    isSupported: !!synth,
    onVoicesReady: onVoicesReady,
    getVoices: function () { return voices.slice(); },
    getHindiVoices: function () { return rankedVoices("hi"); },
    getEnglishVoices: function () { return rankedVoices("en"); },
    bestVoice: bestVoice,
    speak: speak,
    stop: stop
  };
})();
