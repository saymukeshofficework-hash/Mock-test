/* Hindi Varnamala (full alphabet) and Swar (vowels) lessons */
(function () {
  "use strict";

  var SWAR = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "अं", "अः"];

  var VYANJAN_GROUPS = [
    ["क", "ख", "ग", "घ", "ङ"],
    ["च", "छ", "ज", "झ", "ञ"],
    ["ट", "ठ", "ड", "ढ", "ण"],
    ["त", "थ", "द", "ध", "न"],
    ["प", "फ", "ब", "भ", "म"],
    ["य", "र", "ल", "व"],
    ["श", "ष", "स", "ह"],
    ["क्ष", "त्र", "ज्ञ"]
  ];

  function toItems(letters) {
    return letters.map(function (letter) {
      return { display: letter, speech: letter, repeatText: letter };
    });
  }

  var varnamalaLetters = SWAR.slice();
  VYANJAN_GROUPS.forEach(function (g) { varnamalaLetters = varnamalaLetters.concat(g); });

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push(
    {
      id: "hindi-varnamala",
      title: "हिंदी वर्णमाला",
      titleEn: "Hindi Varnamala",
      category: "language",
      language: "hi-IN",
      introduction: "बच्चों, आज हम हिंदी वर्णमाला सीखेंगे। मेरे साथ बोलिए।",
      items: toItems(varnamalaLetters)
    },
    {
      id: "hindi-swar",
      title: "स्वर",
      titleEn: "Swar (Vowels)",
      category: "language",
      language: "hi-IN",
      introduction: "बच्चों, आज हम हिंदी के स्वर सीखेंगे। मेरे साथ बोलिए।",
      items: toItems(SWAR)
    }
  );
})();
