/* Barakhadi (बारहखड़ी): the 12 matra forms of every Hindi consonant.
   One short lesson per consonant, generated from the matra signs so every
   combination is built the same correct way instead of hand-typed 36 times. */
(function () {
  "use strict";

  var CONSONANTS = [
    { letter: "क", roman: "Ka" }, { letter: "ख", roman: "Kha" }, { letter: "ग", roman: "Ga" },
    { letter: "घ", roman: "Gha" }, { letter: "ङ", roman: "Nga" },
    { letter: "च", roman: "Cha" }, { letter: "छ", roman: "Chha" }, { letter: "ज", roman: "Ja" },
    { letter: "झ", roman: "Jha" }, { letter: "ञ", roman: "Nya" },
    { letter: "ट", roman: "Ta" }, { letter: "ठ", roman: "Tha" }, { letter: "ड", roman: "Da" },
    { letter: "ढ", roman: "Dha" }, { letter: "ण", roman: "Na" },
    { letter: "त", roman: "Ta" }, { letter: "थ", roman: "Tha" }, { letter: "द", roman: "Da" },
    { letter: "ध", roman: "Dha" }, { letter: "न", roman: "Na" },
    { letter: "प", roman: "Pa" }, { letter: "फ", roman: "Pha" }, { letter: "ब", roman: "Ba" },
    { letter: "भ", roman: "Bha" }, { letter: "म", roman: "Ma" },
    { letter: "य", roman: "Ya" }, { letter: "र", roman: "Ra" }, { letter: "ल", roman: "La" }, { letter: "व", roman: "Va" },
    { letter: "श", roman: "Sha" }, { letter: "ष", roman: "Shha" }, { letter: "स", roman: "Sa" }, { letter: "ह", roman: "Ha" },
    { letter: "क्ष", roman: "Ksha" }, { letter: "त्र", roman: "Tra" }, { letter: "ज्ञ", roman: "Gya" }
  ];

  // [matra sign (appended to the consonant; "" = the bare inherent-अ form), size label or null]
  var FORMS = [
    ["", "छोटा"],
    ["ा", "बड़ा"],   // ा
    ["ि", "छोटी"],  // ि
    ["ी", "बड़ी"],   // ी
    ["ु", "छोटा"],  // ु
    ["ू", "बड़ा"],   // ू
    ["े", null],    // े
    ["ै", null],    // ै
    ["ो", null],    // ो
    ["ौ", null],    // ौ
    ["ं", null],    // ं anusvara
    ["ः", null]     // ः visarga
  ];

  window.ALL_LESSONS = window.ALL_LESSONS || [];

  CONSONANTS.forEach(function (c, ci) {
    var items = FORMS.map(function (form) {
      var syllable = c.letter + form[0];
      var item = { display: syllable, speech: syllable, repeatText: syllable };
      if (form[1]) item.instruction = form[1] + " " + syllable;
      return item;
    });

    window.ALL_LESSONS.push({
      id: "barakhadi-" + String(ci + 1).padStart(2, "0"),
      title: c.letter + " की बारहखड़ी",
      titleEn: c.roman + " Barakhadi",
      category: "barakhadi",
      language: "hi-IN",
      introduction: "बच्चों, आज हम " + c.letter + " की बारहखड़ी सीखेंगे। मेरे साथ बोलिए।",
      items: items
    });
  });
})();
