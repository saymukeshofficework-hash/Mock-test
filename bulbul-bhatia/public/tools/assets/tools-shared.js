// Shared engine for every standalone tool page: language toggle,
// numerology math (plain-JS port of ../../src/lib/numerology.ts),
// sun-sign lookup (port of ../../src/lib/sunSign.ts), numerology
// meanings (port of ../../src/data/numerologyMeanings.ts), and the
// generic calculator/architecture-form wiring. No build step, no
// framework — just DOM APIs, loaded by every tools/*.html page.
;(function () {
  'use strict'

  var STORAGE_KEY = 'bulbulmam_locale'

  // ---------- Language ----------

  function getLocale() {
    var saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'hi' || saved === 'en' ? saved : 'en'
  }

  function setLocale(locale) {
    window.localStorage.setItem(STORAGE_KEY, locale)
    applyLocale()
  }

  function applyLocale() {
    var locale = getLocale()
    document.documentElement.lang = locale
    document.body.setAttribute('lang', locale)
    if (window.TOOL_TITLE) {
      document.title = (locale === 'hi' ? window.TOOL_TITLE.hi : window.TOOL_TITLE.en) + ' | Bulbul Bhatia'
    }

    document.querySelectorAll('[data-en]').forEach(function (el) {
      var text = locale === 'hi' ? el.getAttribute('data-hi') : el.getAttribute('data-en')
      if (text !== null) el.textContent = text
    })
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      var text = locale === 'hi' ? el.getAttribute('data-hi-placeholder') : el.getAttribute('data-en-placeholder')
      if (text !== null) el.setAttribute('placeholder', text)
    })
    document.querySelectorAll('[data-en-aria]').forEach(function (el) {
      var text = locale === 'hi' ? el.getAttribute('data-hi-aria') : el.getAttribute('data-en-aria')
      if (text !== null) el.setAttribute('aria-label', text)
    })
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === locale ? 'true' : 'false')
    })
  }

  function initLangToggle() {
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLocale(btn.getAttribute('data-lang'))
      })
    })
  }

  // ---------- Numerology (deterministic digit-sum arithmetic) ----------

  var MASTER_NUMBERS = { 11: true, 22: true, 33: true }

  function reduceToDigit(n) {
    n = Math.abs(Math.trunc(n))
    while (n > 9 && !MASTER_NUMBERS[n]) {
      n = String(n)
        .split('')
        .reduce(function (sum, d) { return sum + Number(d) }, 0)
    }
    return n
  }

  var PYTHAGOREAN_MAP = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  }

  function letterSum(name) {
    return name
      .toLowerCase()
      .split('')
      .filter(function (ch) { return PYTHAGOREAN_MAP[ch] !== undefined })
      .reduce(function (sum, ch) { return sum + PYTHAGOREAN_MAP[ch] }, 0)
  }

  function parseDateInput(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!m) return null
    return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
  }

  function lifePathNumber(d) {
    return reduceToDigit(reduceToDigit(d.day) + reduceToDigit(d.month) + reduceToDigit(d.year))
  }

  function destinyNumber(fullName) {
    return reduceToDigit(letterSum(fullName))
  }

  function luckyNumbers(d) {
    var life = lifePathNumber(d)
    var dayNum = reduceToDigit(d.day)
    var set = Array.from(new Set([life, dayNum, reduceToDigit(life + dayNum)]))
    return set.sort(function (a, b) { return a - b })
  }

  function luckyDates(life) {
    var dates = []
    for (var dd = 1; dd <= 31; dd++) {
      if (reduceToDigit(dd) === reduceToDigit(life)) dates.push(dd)
    }
    return dates
  }

  function personalYearNumber(d, year) {
    return reduceToDigit(reduceToDigit(d.day) + reduceToDigit(d.month) + reduceToDigit(year))
  }

  // ---------- Sun sign (Western tropical, calendar-based — genuinely
  // computable from date alone, unlike Vedic Rashi; see rashi-calculator.html) ----------

  var SUN_SIGN_RANGES = [
    { slug: 'capricorn', start: [1, 1], end: [1, 19] },
    { slug: 'aquarius', start: [1, 20], end: [2, 18] },
    { slug: 'pisces', start: [2, 19], end: [3, 20] },
    { slug: 'aries', start: [3, 21], end: [4, 19] },
    { slug: 'taurus', start: [4, 20], end: [5, 20] },
    { slug: 'gemini', start: [5, 21], end: [6, 20] },
    { slug: 'cancer', start: [6, 21], end: [7, 22] },
    { slug: 'leo', start: [7, 23], end: [8, 22] },
    { slug: 'virgo', start: [8, 23], end: [9, 22] },
    { slug: 'libra', start: [9, 23], end: [10, 22] },
    { slug: 'scorpio', start: [10, 23], end: [11, 21] },
    { slug: 'sagittarius', start: [11, 22], end: [12, 21] },
    { slug: 'capricorn', start: [12, 22], end: [12, 31] },
  ]

  function sunSignFromDate(month, day) {
    for (var i = 0; i < SUN_SIGN_RANGES.length; i++) {
      var r = SUN_SIGN_RANGES[i]
      if (month === r.start[0] && month === r.end[0]) {
        if (day >= r.start[1] && day <= r.end[1]) return r.slug
      } else {
        var afterStart = month > r.start[0] || (month === r.start[0] && day >= r.start[1])
        var beforeEnd = month < r.end[0] || (month === r.end[0] && day <= r.end[1])
        if (afterStart && beforeEnd) return r.slug
      }
    }
    return 'capricorn'
  }

  var ZODIAC = {
    aries: { symbol: '♈', name: { en: 'Aries', hi: 'मेष' }, traits: { en: 'Bold, energetic and quick to act.', hi: 'साहसी, ऊर्जावान और शीघ्र निर्णय लेने वाले।' }, strengths: { en: 'Courage, leadership and initiative.', hi: 'साहस, नेतृत्व और पहल क्षमता।' }, challenges: { en: 'Impatience and impulsiveness.', hi: 'अधीरता और आवेगशीलता।' }, guidance: { en: 'Channel your energy with patience rather than haste.', hi: 'अपनी ऊर्जा को जल्दबाज़ी की बजाय धैर्य के साथ लगाएं।' } },
    taurus: { symbol: '♉', name: { en: 'Taurus', hi: 'वृषभ' }, traits: { en: 'Steady, patient and grounded.', hi: 'स्थिर, धैर्यवान और यथार्थवादी।' }, strengths: { en: 'Patience, reliability and practicality.', hi: 'धैर्य, भरोसेमंदी और व्यावहारिकता।' }, challenges: { en: 'Stubbornness and resistance to change.', hi: 'हठधर्मिता और बदलाव से बचाव।' }, guidance: { en: 'Let patience be your strength this season.', hi: 'इस समय धैर्य को अपनी शक्ति बनने दें।' } },
    gemini: { symbol: '♊', name: { en: 'Gemini', hi: 'मिथुन' }, traits: { en: 'Curious, adaptable and communicative.', hi: 'जिज्ञासु, अनुकूलनशील और संवादप्रिय।' }, strengths: { en: 'Curiosity, wit and adaptability.', hi: 'जिज्ञासा, चतुराई और अनुकूलनशीलता।' }, challenges: { en: 'Restlessness and indecision.', hi: 'बेचैनी और अनिर्णय।' }, guidance: { en: 'Focus your scattered energy on one priority at a time.', hi: 'अपनी बिखरी ऊर्जा को एक बार में एक प्राथमिकता पर केंद्रित करें।' } },
    cancer: { symbol: '♋', name: { en: 'Cancer', hi: 'कर्क' }, traits: { en: 'Sensitive, nurturing and intuitive.', hi: 'संवेदनशील, देखभाल करने वाले और सहज ज्ञान से युक्त।' }, strengths: { en: 'Empathy, loyalty and intuition.', hi: 'सहानुभूति, वफादारी और सहज ज्ञान।' }, challenges: { en: 'Moodiness and over-sensitivity.', hi: 'मनोदशा में उतार-चढ़ाव और अति-संवेदनशीलता।' }, guidance: { en: 'Protect your peace without withdrawing from those who care.', hi: 'अपनी शांति की रक्षा करें, पर देखभाल करने वालों से दूर न हों।' } },
    leo: { symbol: '♌', name: { en: 'Leo', hi: 'सिंह' }, traits: { en: 'Confident, warm and expressive.', hi: 'आत्मविश्वासी, उदार और अभिव्यंजक।' }, strengths: { en: 'Confidence, generosity and warmth.', hi: 'आत्मविश्वास, उदारता और स्नेह।' }, challenges: { en: 'Pride and a need for validation.', hi: 'अहंकार और मान्यता की आवश्यकता।' }, guidance: { en: 'Lead with warmth and make room for others to shine too.', hi: 'स्नेह के साथ नेतृत्व करें और दूसरों को भी चमकने का मौका दें।' } },
    virgo: { symbol: '♍', name: { en: 'Virgo', hi: 'कन्या' }, traits: { en: 'Analytical, precise and thoughtful.', hi: 'विश्लेषणात्मक, सटीक और विचारशील।' }, strengths: { en: 'Precision, reliability and analysis.', hi: 'सटीकता, भरोसेमंदी और विश्लेषण क्षमता।' }, challenges: { en: 'Overthinking and self-criticism.', hi: 'अति-चिंतन और आत्म-आलोचना।' }, guidance: { en: 'Be as kind to yourself as you are precise with your work.', hi: 'अपने काम में जितने सटीक हैं, स्वयं के प्रति उतने ही दयालु रहें।' } },
    libra: { symbol: '♎', name: { en: 'Libra', hi: 'तुला' }, traits: { en: 'Balanced, diplomatic and fair-minded.', hi: 'संतुलित, कूटनीतिक और न्यायप्रिय।' }, strengths: { en: 'Diplomacy, fairness and charm.', hi: 'कूटनीति, निष्पक्षता और आकर्षण।' }, challenges: { en: 'Indecision and people-pleasing.', hi: 'अनिर्णय और सबको खुश रखने की प्रवृत्ति।' }, guidance: { en: 'Trust yourself to choose, even when options feel equal.', hi: 'भले ही विकल्प बराबर लगें, चुनने के लिए स्वयं पर भरोसा करें।' } },
    scorpio: { symbol: '♏', name: { en: 'Scorpio', hi: 'वृश्चिक' }, traits: { en: 'Intense, resilient and perceptive.', hi: 'गहन, दृढ़ और सूक्ष्मदर्शी।' }, strengths: { en: 'Determination, depth and resilience.', hi: 'दृढ़ता, गहराई और सहनशक्ति।' }, challenges: { en: 'Suspicion and difficulty letting go.', hi: 'संदेह और चीज़ों को छोड़ने में कठिनाई।' }, guidance: { en: 'Let go of control in areas you cannot change.', hi: 'जिन बातों को आप नहीं बदल सकते, उन पर नियंत्रण छोड़ दें।' } },
    sagittarius: { symbol: '♐', name: { en: 'Sagittarius', hi: 'धनु' }, traits: { en: 'Optimistic, adventurous and honest.', hi: 'आशावादी, साहसी और स्पष्टवादी।' }, strengths: { en: 'Optimism, honesty and adventurousness.', hi: 'आशावाद, ईमानदारी और साहसिकता।' }, challenges: { en: 'Restlessness and bluntness.', hi: 'बेचैनी और अत्यधिक स्पष्टवादिता।' }, guidance: { en: 'Balance your love of freedom with steady commitments.', hi: 'स्वतंत्रता के प्रति अपने प्रेम को स्थिर प्रतिबद्धताओं के साथ संतुलित करें।' } },
    capricorn: { symbol: '♑', name: { en: 'Capricorn', hi: 'मकर' }, traits: { en: 'Disciplined, ambitious and reliable.', hi: 'अनुशासित, महत्वाकांक्षी और भरोसेमंद।' }, strengths: { en: 'Discipline, ambition and responsibility.', hi: 'अनुशासन, महत्वाकांक्षा और ज़िम्मेदारी।' }, challenges: { en: 'Rigidity and overworking.', hi: 'कठोरता और अत्यधिक काम करना।' }, guidance: { en: 'Allow yourself rest — discipline includes recovery.', hi: 'स्वयं को विश्राम करने दें — अनुशासन में पुनर्प्राप्ति भी शामिल है।' } },
    aquarius: { symbol: '♒', name: { en: 'Aquarius', hi: 'कुंभ' }, traits: { en: 'Independent, inventive and idealistic.', hi: 'स्वतंत्र, नवोन्मेषी और आदर्शवादी।' }, strengths: { en: 'Originality, independence and vision.', hi: 'मौलिकता, स्वतंत्रता और दूरदर्शिता।' }, challenges: { en: 'Detachment and unpredictability.', hi: 'अलगाव और अप्रत्याशितता।' }, guidance: { en: 'Stay connected to people even while pursuing your ideals.', hi: 'अपने आदर्शों को आगे बढ़ाते हुए भी लोगों से जुड़े रहें।' } },
    pisces: { symbol: '♓', name: { en: 'Pisces', hi: 'मीन' }, traits: { en: 'Compassionate, imaginative and gentle.', hi: 'दयालु, कल्पनाशील और सौम्य।' }, strengths: { en: 'Compassion, imagination and intuition.', hi: 'करुणा, कल्पनाशीलता और सहज ज्ञान।' }, challenges: { en: 'Escapism and difficulty with boundaries.', hi: 'यथार्थ से पलायन और सीमाएं तय करने में कठिनाई।' }, guidance: { en: 'Stay grounded even as you follow your imagination.', hi: 'अपनी कल्पना का अनुसरण करते हुए भी ज़मीन से जुड़े रहें।' } },
  }

  var NUMEROLOGY_MEANINGS = {
    1: { meaning: { en: 'The number of leadership, independence and new beginnings.', hi: 'नेतृत्व, स्वतंत्रता एवं नई शुरुआत का अंक।' }, strengths: { en: 'Confidence, initiative and originality.', hi: 'आत्मविश्वास, पहल एवं मौलिकता।' }, challenges: { en: 'Impatience and difficulty sharing control.', hi: 'अधीरता एवं नियंत्रण साझा करने में कठिनाई।' }, guidance: { en: 'Lead with confidence, but make space for others.', hi: 'आत्मविश्वास के साथ नेतृत्व करें, पर दूसरों के लिए भी जगह बनाएं।' } },
    2: { meaning: { en: 'The number of partnership, sensitivity and cooperation.', hi: 'साझेदारी, संवेदनशीलता एवं सहयोग का अंक।' }, strengths: { en: 'Diplomacy, patience and intuition.', hi: 'कूटनीति, धैर्य एवं सहज ज्ञान।' }, challenges: { en: 'Over-sensitivity and indecision.', hi: 'अति-संवेदनशीलता एवं अनिर्णय।' }, guidance: { en: 'Trust your instincts about people and timing.', hi: 'लोगों एवं समय के बारे में अपनी सहज बुद्धि पर भरोसा करें।' } },
    3: { meaning: { en: 'The number of expression, creativity and communication.', hi: 'अभिव्यक्ति, रचनात्मकता एवं संवाद का अंक।' }, strengths: { en: 'Creativity, optimism and sociability.', hi: 'रचनात्मकता, आशावाद एवं मिलनसारिता।' }, challenges: { en: 'Scattered focus and over-talking.', hi: 'बिखरा ध्यान एवं अत्यधिक बातूनीपन।' }, guidance: { en: 'Channel your creative energy into one thing at a time.', hi: 'अपनी रचनात्मक ऊर्जा को एक समय में एक कार्य पर केंद्रित करें।' } },
    4: { meaning: { en: 'The number of structure, discipline and hard work.', hi: 'संरचना, अनुशासन एवं परिश्रम का अंक।' }, strengths: { en: 'Reliability, organization and persistence.', hi: 'भरोसेमंदी, संगठन एवं दृढ़ता।' }, challenges: { en: 'Rigidity and resistance to change.', hi: 'कठोरता एवं बदलाव के प्रति प्रतिरोध।' }, guidance: { en: 'Build steadily, but stay open to new methods.', hi: 'स्थिरता से निर्माण करें, पर नए तरीकों के लिए खुले रहें।' } },
    5: { meaning: { en: 'The number of freedom, change and adaptability.', hi: 'स्वतंत्रता, परिवर्तन एवं अनुकूलनशीलता का अंक।' }, strengths: { en: 'Versatility, curiosity and courage.', hi: 'बहुमुखी प्रतिभा, जिज्ञासा एवं साहस।' }, challenges: { en: 'Restlessness and inconsistency.', hi: 'बेचैनी एवं अस्थिरता।' }, guidance: { en: 'Embrace change while honouring your commitments.', hi: 'अपनी प्रतिबद्धताओं का सम्मान करते हुए बदलाव को अपनाएं।' } },
    6: { meaning: { en: 'The number of responsibility, harmony and care.', hi: 'ज़िम्मेदारी, सामंजस्य एवं देखभाल का अंक।' }, strengths: { en: 'Compassion, reliability and nurturing.', hi: 'करुणा, भरोसेमंदी एवं देखभाल।' }, challenges: { en: 'Over-giving and difficulty setting boundaries.', hi: 'अत्यधिक देना एवं सीमाएं तय करने में कठिनाई।' }, guidance: { en: 'Care for others without losing yourself.', hi: 'स्वयं को खोए बिना दूसरों की देखभाल करें।' } },
    7: { meaning: { en: 'The number of introspection, wisdom and spirituality.', hi: 'आत्मचिंतन, ज्ञान एवं आध्यात्मिकता का अंक।' }, strengths: { en: 'Analysis, depth and intuition.', hi: 'विश्लेषण, गहराई एवं सहज ज्ञान।' }, challenges: { en: 'Isolation and overthinking.', hi: 'अलगाव एवं अति-चिंतन।' }, guidance: { en: 'Balance solitude with meaningful connection.', hi: 'एकांत को सार्थक जुड़ाव के साथ संतुलित करें।' } },
    8: { meaning: { en: 'The number of ambition, authority and material achievement.', hi: 'महत्वाकांक्षा, अधिकार एवं भौतिक उपलब्धि का अंक।' }, strengths: { en: 'Drive, discipline and business sense.', hi: 'प्रेरणा, अनुशासन एवं व्यावसायिक समझ।' }, challenges: { en: 'Workaholism and controlling tendencies.', hi: 'अत्यधिक काम करना एवं नियंत्रण की प्रवृत्ति।' }, guidance: { en: 'Pursue success without neglecting wellbeing.', hi: 'स्वास्थ्य की उपेक्षा किए बिना सफलता प्राप्त करें।' } },
    9: { meaning: { en: 'The number of compassion, completion and idealism.', hi: 'करुणा, पूर्णता एवं आदर्शवाद का अंक।' }, strengths: { en: 'Generosity, empathy and vision.', hi: 'उदारता, सहानुभूति एवं दूरदर्शिता।' }, challenges: { en: 'Difficulty letting go and emotional overwhelm.', hi: 'चीज़ों को छोड़ने में कठिनाई एवं भावनात्मक अधिकता।' }, guidance: { en: 'Give generously, and allow yourself to receive too.', hi: 'उदारता से दें, और स्वयं को पाने की भी अनुमति दें।' } },
    11: { meaning: { en: 'A master number of intuition, inspiration and insight.', hi: 'सहज ज्ञान, प्रेरणा एवं अंतर्दृष्टि का मास्टर अंक।' }, strengths: { en: 'Heightened intuition and inspiring presence.', hi: 'प्रबल सहज ज्ञान एवं प्रेरणादायक उपस्थिति।' }, challenges: { en: 'Nervous energy and self-doubt.', hi: 'बेचैन ऊर्जा एवं आत्म-संदेह।' }, guidance: { en: 'Ground your intuition with practical steps.', hi: 'अपनी सहज बुद्धि को व्यावहारिक कदमों से सशक्त करें।' } },
    22: { meaning: { en: 'A master number of large-scale building and vision.', hi: 'बड़े पैमाने पर निर्माण एवं दूरदर्शिता का मास्टर अंक।' }, strengths: { en: 'Practical vision and the ability to build lasting things.', hi: 'व्यावहारिक दूरदर्शिता एवं स्थायी चीज़ें बनाने की क्षमता।' }, challenges: { en: 'Pressure and high self-expectation.', hi: 'दबाव एवं स्वयं से अत्यधिक अपेक्षा।' }, guidance: { en: 'Pace your ambitions realistically.', hi: 'अपनी महत्वाकांक्षाओं को यथार्थवादी गति दें।' } },
    33: { meaning: { en: 'A master number of compassionate teaching and healing.', hi: 'करुणामय शिक्षण एवं उपचार का मास्टर अंक।' }, strengths: { en: 'Nurturing wisdom and selfless service.', hi: 'पोषणकारी ज्ञान एवं निःस्वार्थ सेवा।' }, challenges: { en: 'Self-sacrifice and burnout.', hi: 'आत्म-त्याग एवं थकान।' }, guidance: { en: 'Serve others while protecting your own energy.', hi: 'अपनी ऊर्जा की रक्षा करते हुए दूसरों की सेवा करें।' } },
  }

  function reduceFallback(n) {
    while (n > 9) {
      n = String(n).split('').reduce(function (s, d) { return s + Number(d) }, 0)
    }
    return n
  }

  function meaningFor(n) {
    return NUMEROLOGY_MEANINGS[n] || NUMEROLOGY_MEANINGS[reduceFallback(n)]
  }

  // ---------- Result / notice rendering ----------

  function renderResultCard(target, titleEn, titleHi, value, sections) {
    var locale = getLocale()
    var html =
      '<div class="card result-card">' +
      '<div class="result-hero">' +
      '<p class="eyebrow" data-en="' + esc(titleEn) + '" data-hi="' + esc(titleHi) + '">' + esc(locale === 'hi' ? titleHi : titleEn) + '</p>' +
      '<p class="result-value">' + esc(value) + '</p>' +
      '</div>' +
      '<div class="result-sections">' +
      sections.map(function (s) {
        return (
          '<div><h3 data-en="' + esc(s.labelEn) + '" data-hi="' + esc(s.labelHi) + '">' + esc(locale === 'hi' ? s.labelHi : s.labelEn) + '</h3>' +
          '<p data-en="' + esc(s.textEn) + '" data-hi="' + esc(s.textHi) + '">' + esc(locale === 'hi' ? s.textHi : s.textEn) + '</p></div>'
        )
      }).join('') +
      '</div>' +
      '<div class="result-cta">' +
      '<p data-en="Want Deeper Guidance?" data-hi="गहन मार्गदर्शन चाहिए?">' + (locale === 'hi' ? 'गहन मार्गदर्शन चाहिए?' : 'Want Deeper Guidance?') + '</p>' +
      '<p class="note" data-en="Free tools provide general information. For personalized interpretation, consult Bulbul Bhatia." data-hi="निःशुल्क टूल्स सामान्य जानकारी देते हैं। व्यक्तिगत विश्लेषण के लिए बुलबुल भाटिया से परामर्श करें।">' +
      (locale === 'hi' ? 'निःशुल्क टूल्स सामान्य जानकारी देते हैं। व्यक्तिगत विश्लेषण के लिए बुलबुल भाटिया से परामर्श करें।' : 'Free tools provide general information. For personalized interpretation, consult Bulbul Bhatia.') +
      '</p>' +
      '<div class="actions">' +
      '<a class="btn-primary btn-sm" href="../book" data-en="Book Astrology Consultation" data-hi="ज्योतिष परामर्श बुक करें">' + (locale === 'hi' ? 'ज्योतिष परामर्श बुक करें' : 'Book Astrology Consultation') + '</a>' +
      '<a class="btn-secondary btn-sm" href="../book" data-en="Book Tarot Reading" data-hi="टैरो रीडिंग बुक करें">' + (locale === 'hi' ? 'टैरो रीडिंग बुक करें' : 'Book Tarot Reading') + '</a>' +
      '</div></div></div>'
    target.innerHTML = html
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function sectionLabels() {
    return {
      meaning: { en: 'What This Means', hi: 'इसका अर्थ' },
      strengths: { en: 'Strengths', hi: 'ताकतें' },
      challenges: { en: 'Challenges', hi: 'चुनौतियां' },
      guidance: { en: 'Guidance', hi: 'मार्गदर्शन' },
    }
  }

  function numberSections(n) {
    var m = meaningFor(n)
    var l = sectionLabels()
    return [
      { labelEn: l.meaning.en, labelHi: l.meaning.hi, textEn: m.meaning.en, textHi: m.meaning.hi },
      { labelEn: l.strengths.en, labelHi: l.strengths.hi, textEn: m.strengths.en, textHi: m.strengths.hi },
      { labelEn: l.challenges.en, labelHi: l.challenges.hi, textEn: m.challenges.en, textHi: m.challenges.hi },
      { labelEn: l.guidance.en, labelHi: l.guidance.hi, textEn: m.guidance.en, textHi: m.guidance.hi },
    ]
  }

  function showFieldError(input, errorEl) {
    input.setAttribute('aria-invalid', 'true')
    errorEl.style.display = 'block'
    applyLocale()
  }
  function clearFieldError(input, errorEl) {
    input.removeAttribute('aria-invalid')
    errorEl.style.display = 'none'
  }

  // ---------- Live calculators, keyed by tool slug ----------

  var CALCULATORS = {
    'life-path-number-calculator': function () {
      wireDateOnly('dob', function (d) {
        var n = lifePathNumber(d)
        renderResultCard(byId('result'), 'Your Life Path Number', 'आपका जीवन पथ अंक', String(n), numberSections(n))
      })
    },
    'destiny-number-calculator': function () {
      wireNameOnly('full-name', function (name) {
        var n = destinyNumber(name)
        renderResultCard(byId('result'), 'Your Destiny Number', 'आपका भाग्य अंक', String(n), numberSections(n))
      })
    },
    'name-number-calculator': function () {
      wireNameOnly('full-name', function (name) {
        var n = destinyNumber(name)
        renderResultCard(byId('result'), 'Name Number', 'नाम अंक', String(n), numberSections(n))
      })
    },
    'lucky-number-calculator': function () {
      wireDateOnly('dob', function (d) {
        var nums = luckyNumbers(d)
        renderResultCard(byId('result'), 'Your Lucky Numbers', 'आपके शुभ अंक', nums.join(' • '), [
          { labelEn: 'What This Means', labelHi: 'इसका अर्थ', textEn: 'These numbers are numerologically linked to your birth date and can be a helpful reference for important decisions.', textHi: 'ये अंक आपकी जन्म तिथि से अंकशास्त्रीय रूप से जुड़े हैं और महत्वपूर्ण निर्णयों में सहायक हो सकते हैं।' },
          { labelEn: 'Guidance', labelHi: 'मार्गदर्शन', textEn: 'Use these as a supportive signal, not the sole basis for a decision.', textHi: 'इन्हें एक सहायक संकेत के रूप में उपयोग करें, निर्णय का एकमात्र आधार नहीं।' },
        ])
      })
    },
    'lucky-date-calculator': function () {
      wireDateOnly('dob', function (d) {
        var life = lifePathNumber(d)
        var dates = luckyDates(life)
        renderResultCard(byId('result'), 'Lucky Dates (each month)', 'शुभ तिथियां (हर माह)', dates.join(', '), [
          { labelEn: 'What This Means', labelHi: 'इसका अर्थ', textEn: 'These dates align with your Life Path number ' + life + '.', textHi: 'ये तिथियां आपके जीवन पथ अंक ' + life + ' के अनुरूप हैं।' },
        ])
      })
    },
    'personal-year-calculator': function () {
      wireDateOnly('dob', function (d) {
        var year = new Date().getFullYear()
        var n = personalYearNumber(d, year)
        renderResultCard(byId('result'), 'Your Personal Year (' + year + ')', 'आपका व्यक्तिगत वर्ष (' + year + ')', String(n), numberSections(n))
      })
    },
    'sun-sign-calculator': function () {
      wireDateOnly('dob', function (d) {
        var slug = sunSignFromDate(d.month, d.day)
        var z = ZODIAC[slug]
        renderResultCard(byId('result'), 'Your Sun Sign', 'आपकी सूर्य राशि', z.symbol + ' ' + z.name.en + ' / ' + z.name.hi, [
          { labelEn: 'What This Means', labelHi: 'इसका अर्थ', textEn: z.traits.en, textHi: z.traits.hi },
          { labelEn: 'Strengths', labelHi: 'ताकतें', textEn: z.strengths.en, textHi: z.strengths.hi },
          { labelEn: 'Challenges', labelHi: 'चुनौतियां', textEn: z.challenges.en, textHi: z.challenges.hi },
          { labelEn: 'Guidance', labelHi: 'मार्गदर्शन', textEn: z.guidance.en, textHi: z.guidance.hi },
        ])
      })
    },
    'numerology-calculator': function () {
      var form = byId('calc-form')
      if (!form) return
      form.addEventListener('submit', function (e) {
        e.preventDefault()
        var nameInput = byId('full-name')
        var dobInput = byId('dob')
        var nameErr = byId('full-name-error')
        var dobErr = byId('dob-error')
        var ok = true
        if (!nameInput.value.trim()) { showFieldError(nameInput, nameErr); ok = false } else clearFieldError(nameInput, nameErr)
        var d = parseDateInput(dobInput.value)
        if (!d) { showFieldError(dobInput, dobErr); ok = false } else clearFieldError(dobInput, dobErr)
        if (!ok) return
        var life = lifePathNumber(d)
        var destiny = destinyNumber(nameInput.value.trim())
        var locale = getLocale()
        var result = byId('result')
        result.innerHTML =
          '<div class="tool-grid" style="grid-template-columns:1fr 1fr;display:grid;gap:1.5rem;"><div id="r1"></div><div id="r2"></div></div>'
        renderResultCard(byId('r1'), 'Life Path Number', 'जीवन पथ अंक', String(life), numberSections(life).slice(0, 2))
        renderResultCard(byId('r2'), 'Destiny Number', 'भाग्य अंक', String(destiny), numberSections(destiny).slice(0, 2))
        void locale
      })
    },
  }

  function byId(id) { return document.getElementById(id) }

  function wireDateOnly(inputId, onCompute) {
    var form = byId('calc-form')
    if (!form) return
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var input = byId(inputId)
      var err = byId(inputId + '-error')
      var d = parseDateInput(input.value)
      if (!d) { showFieldError(input, err); return }
      clearFieldError(input, err)
      onCompute(d)
    })
  }

  function wireNameOnly(inputId, onCompute) {
    var form = byId('calc-form')
    if (!form) return
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var input = byId(inputId)
      var err = byId(inputId + '-error')
      if (!input.value.trim()) { showFieldError(input, err); return }
      clearFieldError(input, err)
      onCompute(input.value.trim())
    })
  }

  function wireArchitectureForm() {
    var form = byId('calc-form')
    var notice = byId('notice')
    if (!form || !notice) return
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      notice.style.display = 'block'
      notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  // ---------- Boot ----------

  document.addEventListener('DOMContentLoaded', function () {
    initLangToggle()
    applyLocale()

    var slug = window.TOOL_SLUG
    var vedic = window.VedicCalculators || {}
    if (slug && CALCULATORS[slug]) {
      CALCULATORS[slug]()
    } else if (slug && vedic[slug]) {
      vedic[slug]()
    } else {
      wireArchitectureForm()
    }
  })

  window.ToolsShared = {
    getLocale: getLocale,
    applyLocale: applyLocale,
    renderResultCard: renderResultCard,
    showFieldError: showFieldError,
    clearFieldError: clearFieldError,
    byId: byId,
    esc: esc,
  }
})()
