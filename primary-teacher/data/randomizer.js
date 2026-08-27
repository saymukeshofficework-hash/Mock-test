/* Random-order practice lessons: same items as an existing full lesson, but
   the lesson engine reshuffles the order on every Start/Restart (see
   LessonEngine.start -> shuffleInPlace, gated on lesson.randomize).
   Items arrays are shallow copies (shared item objects) of the base lesson's
   items, so a base lesson's own order is never touched, and any audio
   attached later via data/audio-manifest.js (which mutates the shared item
   objects) is automatically picked up here too. Must load after the data
   files that define the base lessons below. */
(function () {
  "use strict";

  function findLesson(id) {
    return (window.ALL_LESSONS || []).find(function (l) { return l.id === id; });
  }

  function makeRandomLesson(baseId, id, title, titleEn, introduction) {
    var base = findLesson(baseId);
    if (!base) return null;
    return {
      id: id,
      title: title,
      titleEn: titleEn,
      category: "random",
      language: base.language,
      introduction: introduction,
      randomize: true,
      items: base.items.slice()
    };
  }

  window.ALL_LESSONS = window.ALL_LESSONS || [];
  [
    makeRandomLesson(
      "barakhadi-all", "random-barakhadi",
      "बारहखड़ी (रैंडम क्रम)", "Barakhadi (Random Order)",
      "बच्चों, आज हम बारहखड़ी का अभ्यास रैंडम क्रम में करेंगे। ध्यान से सुनिए और मेरे साथ बोलिए।"
    ),
    makeRandomLesson(
      "counting-hi-1-100", "random-counting-hi",
      "गिनती (रैंडम क्रम)", "Hindi Counting (Random Order)",
      "बच्चों, आज हम गिनती का अभ्यास रैंडम क्रम में करेंगे। ध्यान से सुनिए और मेरे साथ बोलिए।"
    ),
    makeRandomLesson(
      "counting-en-1-100", "random-counting-en",
      "English Counting (Random Order)", "English Counting (Random Order)",
      "Children, today we will practice counting in random order. Listen carefully and repeat after me."
    )
  ].forEach(function (lesson) { if (lesson) window.ALL_LESSONS.push(lesson); });
})();
