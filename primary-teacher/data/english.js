/* English alphabet A-Z */
(function () {
  "use strict";

  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  var items = LETTERS.map(function (letter) {
    return { display: letter, speech: letter, repeatText: letter };
  });

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push({
    id: "english-a-z",
    title: "English A-Z",
    titleEn: "English A-Z",
    category: "language",
    language: "en-IN",
    introduction: "Children, today we will learn the English alphabet. Listen carefully and repeat after me.",
    items: items
  });
})();
