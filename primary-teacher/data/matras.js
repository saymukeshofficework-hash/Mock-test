/* Matra (vowel-sign) introduction words.
   Structured as a simple list so more matra sets (ि, ी, ु, ू, े, ै, ो, ौ ...) can be
   appended later without any change to the lesson engine or UI. */
(function () {
  "use strict";

  var MATRA_WORDS = [
    { letter: "अ", word: "अनार" },
    { letter: "आ", word: "आम" },
    { letter: "इ", word: "इमली" },
    { letter: "ई", word: "ईख" },
    { letter: "उ", word: "उल्लू" },
    { letter: "ऊ", word: "ऊन" }
  ];

  var items = MATRA_WORDS.map(function (m) {
    return {
      display: m.letter + " — " + m.word,
      speech: m.letter + " से " + m.word,
      repeatText: m.letter + " से " + m.word,
      instruction: m.letter + " की मात्रा"
    };
  });

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push({
    id: "matras-basic",
    title: "मात्राएँ",
    titleEn: "Matras",
    category: "language",
    language: "hi-IN",
    introduction: "बच्चों, आज हम मात्राओं के साथ शब्द सीखेंगे। मेरे साथ बोलिए।",
    items: items
  });
})();
