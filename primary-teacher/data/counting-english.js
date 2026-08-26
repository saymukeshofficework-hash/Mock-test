/* English number names 1-100, generated explicitly into a lookup array (no digits ever sent to TTS). */
(function () {
  "use strict";

  var ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var ONES_LOWER = ONES.map(function (w) { return w.toLowerCase(); });
  var TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numberToWords(n) {
    if (n === 100) return "One hundred";
    if (n < 20) return ONES[n];
    var t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? "-" + ONES_LOWER[o] : "");
  }

  var ENGLISH_NUMBER_WORDS = [""];
  for (var n = 1; n <= 100; n++) ENGLISH_NUMBER_WORDS.push(numberToWords(n));

  function makeItems(from, to) {
    var items = [];
    for (var i = from; i <= to; i++) {
      items.push({ display: String(i), speech: ENGLISH_NUMBER_WORDS[i], repeatText: ENGLISH_NUMBER_WORDS[i] });
    }
    return items;
  }

  window.ENGLISH_NUMBER_WORDS = ENGLISH_NUMBER_WORDS;

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push({
    id: "counting-en-1-100",
    title: "English Counting 1-100",
    titleEn: "English Counting 1-100",
    category: "counting",
    language: "en-IN",
    introduction: "Children, today we will learn to count from one to one hundred. Listen carefully and repeat after me.",
    items: makeItems(1, 100)
  });
})();
