/* Hindi number names 1-100. Display uses standard digits; speech/repeat use Hindi words. */
(function () {
  "use strict";

  var HINDI_NUMBER_WORDS = [
    "", // 0 unused
    "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस",
    "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस",
    "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस",
    "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस",
    "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास",
    "इक्यावन", "बावन", "तिरपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ",
    "इकसठ", "बासठ", "तिरसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर", "सत्तर",
    "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उन्यासी", "अस्सी",
    "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सतासी", "अट्ठासी", "नवासी", "नब्बे",
    "इक्यानवे", "बानवे", "तिरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे", "सौ"
  ];

  function makeItems(from, to) {
    var items = [];
    for (var n = from; n <= to; n++) {
      items.push({ display: String(n), speech: HINDI_NUMBER_WORDS[n], repeatText: HINDI_NUMBER_WORDS[n] });
    }
    return items;
  }

  window.HINDI_NUMBER_WORDS = HINDI_NUMBER_WORDS;

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  window.ALL_LESSONS.push(
    {
      id: "counting-hi-1-10",
      title: "गिनती 1 से 10",
      titleEn: "Hindi Counting 1-10",
      category: "counting",
      language: "hi-IN",
      introduction: "बच्चों, आज हम एक से दस तक गिनती सीखेंगे। मेरे साथ बोलिए।",
      items: makeItems(1, 10)
    },
    {
      id: "counting-hi-11-20",
      title: "गिनती 11 से 20",
      titleEn: "Hindi Counting 11-20",
      category: "counting",
      language: "hi-IN",
      introduction: "बच्चों, अब हम ग्यारह से बीस तक गिनती सीखेंगे। मेरे साथ बोलिए।",
      items: makeItems(11, 20)
    },
    {
      id: "counting-hi-1-100",
      title: "गिनती 1 से 100",
      titleEn: "Hindi Counting 1-100",
      category: "counting",
      language: "hi-IN",
      introduction: "बच्चों, आज हम एक से सौ तक गिनती सीखेंगे। ध्यान से सुनिए और मेरे साथ बोलिए।",
      items: makeItems(1, 100)
    }
  );
})();
