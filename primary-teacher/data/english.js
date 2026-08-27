/* English alphabet A-Z */
(function () {
  "use strict";

  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  var items = LETTERS.map(function (letter) {
    // Some voices announce a bare uppercase letter as "Capital A" to disambiguate
    // from lowercase; sending the lowercase form avoids that while the display
    // stays uppercase (the standard way to show the English alphabet).
    var spoken = letter.toLowerCase();
    return { display: letter, speech: spoken, repeatText: spoken };
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
