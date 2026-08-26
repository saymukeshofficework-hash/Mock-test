/* Two-letter words, three-letter words, and object counting (with emoji placeholders
   that can be swapped for real images later via the optional `image` field). */
(function () {
  "use strict";

  function toItems(words) {
    return words.map(function (w) {
      return { display: w, speech: w, repeatText: w };
    });
  }

  var TWO_LETTER_WORDS = ["कम", "घर", "जल", "फल", "बस", "वन", "नल", "रथ", "मन", "कल"];
  var THREE_LETTER_WORDS = ["कमल", "नगर", "मटर", "गरम", "नयन", "कलम", "सड़क"];

  var numberWords = window.HINDI_NUMBER_WORDS || [];
  var objectItems = [];
  for (var n = 1; n <= 10; n++) {
    objectItems.push({
      display: "🍎".repeat(n),
      speech: numberWords[n] + " सेब",
      repeatText: numberWords[n] + " सेब",
      instruction: "गिनो और बोलो",
      image: null
    });
  }

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push(
    {
      id: "words-two-letter",
      title: "दो-अक्षर वाले शब्द",
      titleEn: "Two-letter Hindi words",
      category: "language",
      language: "hi-IN",
      introduction: "बच्चों, आज हम दो अक्षर वाले शब्द सीखेंगे। मेरे साथ बोलिए।",
      items: toItems(TWO_LETTER_WORDS)
    },
    {
      id: "words-three-letter",
      title: "तीन-अक्षर वाले शब्द",
      titleEn: "Three-letter Hindi words",
      category: "language",
      language: "hi-IN",
      introduction: "बच्चों, आज हम तीन अक्षर वाले शब्द सीखेंगे। मेरे साथ बोलिए।",
      items: toItems(THREE_LETTER_WORDS)
    },
    {
      id: "object-counting",
      title: "वस्तुओं के साथ गिनती",
      titleEn: "Object counting",
      category: "counting",
      language: "hi-IN",
      introduction: "बच्चों, आज हम वस्तुओं को गिनना सीखेंगे। ध्यान से देखिए और गिनिए।",
      items: objectItems
    }
  );
})();
