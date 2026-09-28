// UI copy for the Typing Practice page, Hindi + English. The page follows the site-
// wide language toggle from /js/i18n.js (same localStorage key, Hindi by default).
// Hindi here is written the way students actually speak — "टाइपिंग शुरू करें",
// not "टंकण प्रारंभ करें".

const STR = {
  // nav / header
  nav_typing: { en: "Typing Practice", hi: "टाइपिंग प्रैक्टिस" },
  nav_progress: { en: "My Progress", hi: "मेरी प्रगति" },

  // hero
  hero_eyebrow: { en: "English • Hindi Unicode • Mangal • Krutidev", hi: "English • Hindi Unicode • Mangal • Krutidev" },
  hero_h1: { en: "Typing Practice Test", hi: "टाइपिंग प्रैक्टिस टेस्ट" },
  hero_sub: {
    en: "Practise regularly to build your English and Hindi typing speed, accuracy and confidence.",
    hi: "अंग्रेज़ी और हिंदी टाइपिंग की गति, शुद्धता और दक्षता बढ़ाने के लिए नियमित अभ्यास करें।",
  },
  hero_cta: { en: "Start Typing Practice", hi: "टाइपिंग शुरू करें" },
  hero_how: { en: "How It Works", hi: "कैसे काम करता है" },

  // format + settings
  format_h2: { en: "Choose Typing Format", hi: "टाइपिंग फॉर्मेट चुनें" },
  settings_h2: { en: "Practice Settings", hi: "प्रैक्टिस सेटिंग्स" },
  duration: { en: "Duration", hi: "समय" },
  difficulty: { en: "Difficulty", hi: "कठिनाई" },
  passage: { en: "Passage", hi: "पैराग्राफ" },
  custom: { en: "Custom", hi: "अपना समय" },
  custom_minutes: { en: "Minutes (1–60)", hi: "मिनट (1–60)" },
  sec: { en: "sec", hi: "सेकंड" },
  min: { en: "min", hi: "मिनट" },
  d_easy: { en: "Easy", hi: "आसान" },
  d_medium: { en: "Medium", hi: "मध्यम" },
  d_hard: { en: "Hard", hi: "कठिन" },
  d_exam: { en: "Exam Mode", hi: "परीक्षा स्तर" },
  l_random: { en: "Random", hi: "कोई भी" },
  l_short: { en: "Short", hi: "छोटा" },
  l_medium: { en: "Medium", hi: "मध्यम" },
  l_long: { en: "Long", hi: "लंबा" },
  start_btn: { en: "Start Typing Practice", hi: "टाइपिंग शुरू करें" },
  start_hint: { en: "The timer starts when you type the first letter.", hi: "पहला अक्षर टाइप करते ही टाइमर शुरू होगा।" },

  // font notices
  kd_font_missing: {
    en: "Kruti Dev font not found on this device. The passage is shown in Krutidev key codes, with the Hindi text below for reference. Install “Kruti Dev 010” to see it in Hindi.",
    hi: "इस डिवाइस पर कृतिदेव फ़ॉन्ट नहीं मिला। पैराग्राफ कृतिदेव की-कोड में दिखेगा और नीचे हिंदी में भी लिखा रहेगा। हिंदी में देखने के लिए “Kruti Dev 010” फ़ॉन्ट इंस्टॉल करें।",
  },
  kd_tip: {
    en: "Krutidev uses the Remington layout: keep your keyboard in English (Latin) mode and turn off auto-correct.",
    hi: "कृतिदेव में रेमिंगटन लेआउट चलता है: कीबोर्ड को English मोड में रखें और ऑटो-करेक्ट बंद रखें।",
  },
  hi_tip: {
    en: "Type with any Hindi keyboard — Inscript, phonetic, Gboard Hindi or Google Input Tools.",
    hi: "किसी भी हिंदी कीबोर्ड से टाइप करें — Inscript, फ़ोनेटिक, Gboard हिंदी या Google Input Tools।",
  },
  mangal_tip: {
    en: "Government typing tests usually use Mangal with the Inscript keyboard.",
    hi: "सरकारी टाइपिंग टेस्ट में आमतौर पर Inscript कीबोर्ड के साथ मंगल फ़ॉन्ट होता है।",
  },
  unicode_ref: { en: "Hindi text (for reference)", hi: "हिंदी पाठ (संदर्भ के लिए)" },

  // modes
  modes_h2: { en: "Practice Modes", hi: "प्रैक्टिस मोड" },
  mode_quick: { en: "Quick Practice", hi: "झटपट अभ्यास" },
  mode_quick_d: { en: "30 seconds — a fast warm-up.", hi: "30 सेकंड — जल्दी से वार्म-अप।" },
  mode_standard: { en: "Standard Test", hi: "स्टैंडर्ड टेस्ट" },
  mode_standard_d: { en: "1 minute — the usual speed test.", hi: "1 मिनट — सामान्य स्पीड टेस्ट।" },
  mode_long: { en: "Long Practice", hi: "लंबा अभ्यास" },
  mode_long_d: { en: "5 minutes — build stamina.", hi: "5 मिनट — लगातार टाइपिंग की आदत।" },
  mode_exam: { en: "Exam Practice", hi: "परीक्षा अभ्यास" },
  mode_exam_d: { en: "Your duration, a fixed passage, exam rules.", hi: "अपना समय, तय पैराग्राफ, परीक्षा जैसे नियम।" },
  mode_start: { en: "Start", hi: "शुरू करें" },
  mode_practice: { en: "Practice", hi: "अभ्यास" },
  mode_daily: { en: "Daily Challenge", hi: "आज का अभ्यास" },

  // daily
  daily_h2: { en: "Today's Practice", hi: "आज का अभ्यास" },
  daily_lang: { en: "Language", hi: "भाषा" },
  daily_est: { en: "Estimated time", hi: "अनुमानित समय" },
  daily_cta: { en: "Start Today's Practice", hi: "आज का अभ्यास शुरू करें" },
  daily_done: { en: "Done today", hi: "आज पूरा हुआ" },
  daily_again: { en: "Practise Again", hi: "फिर से अभ्यास करें" },
  daily_note: { en: "A new passage every day, the same for every student.", hi: "हर दिन नया पैराग्राफ, सभी विद्यार्थियों के लिए एक जैसा।" },

  // progress + history
  progress_h2: { en: "My Typing Progress", hi: "मेरी टाइपिंग प्रगति" },
  progress_lead: { en: "Saved in this browser only — no login needed.", hi: "सिर्फ़ इसी ब्राउज़र में सेव होता है — लॉगिन की ज़रूरत नहीं।" },
  best_wpm: { en: "Best WPM", hi: "सबसे अच्छी WPM" },
  avg_wpm: { en: "Average WPM", hi: "औसत WPM" },
  best_acc: { en: "Best Accuracy", hi: "सबसे अच्छी सटीकता" },
  tests_done: { en: "Tests Completed", hi: "पूरे किए टेस्ट" },
  total_time: { en: "Total Practice Time", hi: "कुल अभ्यास समय" },
  best: { en: "Best", hi: "सबसे अच्छा" },
  average: { en: "Average", hi: "औसत" },
  tests: { en: "tests", hi: "टेस्ट" },
  no_tests_format: { en: "No tests yet", hi: "अभी कोई टेस्ट नहीं" },
  history_h2: { en: "Test History", hi: "टेस्ट हिस्ट्री" },
  history_empty: { en: "Your completed tests will appear here.", hi: "आपके पूरे किए गए टेस्ट यहाँ दिखेंगे।" },
  h_date: { en: "Date", hi: "तारीख" },
  h_lang: { en: "Language", hi: "भाषा" },
  h_mode: { en: "Mode", hi: "मोड" },
  h_duration: { en: "Duration", hi: "समय" },
  clear_history: { en: "Clear history", hi: "हिस्ट्री मिटाएँ" },
  clear_confirm_t: { en: "Clear typing history?", hi: "टाइपिंग हिस्ट्री मिटाएँ?" },
  clear_confirm_m: { en: "All saved results on this device will be deleted.", hi: "इस डिवाइस पर सेव सभी रिज़ल्ट मिट जाएँगे।" },
  clear: { en: "Clear", hi: "मिटाएँ" },
  storage_off: {
    en: "This browser is not allowing storage (private mode?). You can practise, but results won't be saved after you close the page.",
    hi: "यह ब्राउज़र डेटा सेव नहीं करने दे रहा (शायद प्राइवेट मोड)। आप अभ्यास कर सकते हैं, पर पेज बंद करने पर रिज़ल्ट सेव नहीं रहेंगे।",
  },

  // instructions
  how_h2: { en: "How to take the typing test", hi: "टाइपिंग टेस्ट कैसे दें?" },
  how_1: { en: "Choose your language and typing format.", hi: "अपनी भाषा और टाइपिंग फॉर्मेट चुनें।" },
  how_2: { en: "Choose the duration.", hi: "समय चुनें।" },
  how_3: { en: "Look at the passage and type it.", hi: "दिए गए पैराग्राफ को देखकर टाइप करें।" },
  how_4: { en: "Type as accurately as you can.", hi: "जितना संभव हो उतना सही टाइप करें।" },
  how_5: { en: "When the test ends, check your speed and accuracy.", hi: "टेस्ट पूरा होने पर अपनी Speed और Accuracy देखें।" },

  // test screen
  test_title: { en: "Typing Practice Test", hi: "टाइपिंग प्रैक्टिस टेस्ट" },
  exam_title: { en: "Typing Exam", hi: "टाइपिंग परीक्षा" },
  time_left: { en: "Time Left", hi: "बचा हुआ समय" },
  wpm: { en: "WPM", hi: "WPM" },
  accuracy: { en: "Accuracy", hi: "सटीकता" },
  errors: { en: "Errors", hi: "गलतियाँ" },
  cpm: { en: "CPM", hi: "CPM" },
  time: { en: "Time", hi: "समय" },
  progress: { en: "Progress", hi: "प्रगति" },
  typing_progress: { en: "Typing Progress", hi: "टाइपिंग प्रगति" },
  pause: { en: "Pause", hi: "रोकें" },
  resume: { en: "Resume", hi: "जारी रखें" },
  restart: { en: "Restart", hi: "फिर से शुरू" },
  end_test: { en: "End Test", hi: "टेस्ट खत्म करें" },
  input_label: { en: "Type the passage here", hi: "पैराग्राफ यहाँ टाइप करें" },
  input_ph: { en: "Tap here and start typing…", hi: "यहाँ टैप करें और टाइप करना शुरू करें…" },
  test_hint: { en: "Timer starts with your first letter · Esc to pause", hi: "पहले अक्षर से टाइमर शुरू · Esc दबाकर रोकें" },
  paused_t: { en: "Test paused", hi: "टेस्ट रुका हुआ है" },
  paused_m: { en: "Your time and typing are saved. Continue exactly where you stopped.", hi: "आपका समय और टाइप किया हुआ सुरक्षित है। जहाँ रुके थे वहीं से जारी रखें।" },
  paused_auto: { en: "Paused because you left this tab.", hi: "टैब बदलने की वजह से टेस्ट रुक गया।" },
  restart_t: { en: "Restart this test?", hi: "यह टेस्ट फिर से शुरू करें?" },
  restart_m: { en: "Your current progress will be lost.", hi: "अभी तक का टाइप किया हुआ मिट जाएगा।" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  end_t: { en: "End the test now?", hi: "टेस्ट अभी खत्म करें?" },
  end_m: { en: "Your result will be calculated from what you have typed so far.", hi: "अब तक टाइप किए गए हिस्से से रिज़ल्ट बनेगा।" },
  kbd_hide: { en: "Hide keyboard", hi: "कीबोर्ड छिपाएँ" },
  kbd_show: { en: "Keyboard", hi: "कीबोर्ड" },
  portrait_tip: { en: "Tip: hold your phone upright — portrait gives much more room while the keyboard is open.", hi: "सुझाव: फ़ोन को सीधा (portrait) पकड़ें — कीबोर्ड खुला होने पर ज़्यादा जगह मिलेगी।" },
  complete: { en: "Test complete", hi: "टेस्ट पूरा हुआ" },
  paste_blocked: { en: "Pasting is turned off — type the passage yourself.", hi: "पेस्ट बंद है — पैराग्राफ खुद टाइप करें।" },
  exam_paste_warn: { en: "Warning: paste/cut is not allowed in the exam. This attempt has been noted.", hi: "चेतावनी: परीक्षा में पेस्ट/कट की अनुमति नहीं है। यह प्रयास दर्ज किया गया है।" },
  exam_insert_warn: { en: "Warning: a large block of text was inserted at once. This has been noted.", hi: "चेतावनी: एक साथ बहुत सारा टेक्स्ट डाला गया। यह दर्ज किया गया है।" },
  exam_tab_warn: { en: "Warning: you left the exam tab. The timer kept running and this has been noted.", hi: "चेतावनी: आपने परीक्षा का टैब छोड़ा। टाइमर चलता रहा और यह दर्ज किया गया है।" },
  no_passage: { en: "No passage is available for these settings. Try another difficulty or format.", hi: "इन सेटिंग्स के लिए कोई पैराग्राफ नहीं मिला। कोई दूसरी कठिनाई या फॉर्मेट चुनें।" },
  too_short: { en: "That was too short to measure. Type for at least a few seconds.", hi: "टेस्ट इतना छोटा था कि माप नहीं हो सका। कम से कम कुछ सेकंड टाइप करें।" },
  nothing_typed: { en: "You didn't type anything, so there is no result to show.", hi: "आपने कुछ टाइप नहीं किया, इसलिए कोई रिज़ल्ट नहीं है।" },
  leave_warn: { en: "Your test is in progress. Leave anyway?", hi: "आपका टेस्ट चल रहा है। फिर भी छोड़ें?" },
  generic_error: { en: "Something went wrong. Please reload the page and try again.", hi: "कुछ गड़बड़ हो गई। पेज दोबारा लोड करके फिर कोशिश करें।" },

  // exam intro
  exam_intro_t: { en: "Before you begin", hi: "शुरू करने से पहले" },
  exam_intro_s: { en: "Set up your typing exam and read the instructions.", hi: "अपनी टाइपिंग परीक्षा सेट करें और निर्देश पढ़ें।" },
  student_name: { en: "Student Name (optional)", hi: "विद्यार्थी का नाम (वैकल्पिक)" },
  name_ph: { en: "e.g. Riya Sharma", hi: "जैसे: रिया शर्मा" },
  language: { en: "Language", hi: "भाषा" },
  instructions: { en: "Instructions", hi: "निर्देश" },
  ei_1: { en: "Type the displayed passage exactly.", hi: "दिखाया गया पैराग्राफ बिल्कुल वैसा ही टाइप करें।" },
  ei_2: { en: "Avoid unnecessary corrections.", hi: "बेवजह बार-बार सुधार न करें।" },
  ei_3: { en: "Accuracy affects the final score.", hi: "सटीकता का असर आपके अंतिम स्कोर पर पड़ेगा।" },
  ei_4: { en: "The timer starts when you begin typing.", hi: "टाइप करना शुरू करते ही टाइमर चालू होगा।" },
  ei_5: { en: "Do not refresh the page during the test.", hi: "टेस्ट के दौरान पेज रिफ़्रेश न करें।" },
  ei_6: { en: "Paste is disabled; paste attempts and tab switches are recorded on your result. These checks discourage copying but cannot fully prevent it.", hi: "पेस्ट बंद है; पेस्ट की कोशिश और टैब बदलना रिज़ल्ट पर दर्ज होगा। ये जाँचें नकल को रोकने में मदद करती हैं, पर पूरी तरह रोक नहीं सकतीं।" },
  agree: { en: "I have read the instructions.", hi: "मैंने निर्देश पढ़ लिए हैं।" },
  start_test: { en: "Start Test", hi: "टेस्ट शुरू करें" },
  back: { en: "‹ Back", hi: "‹ वापस" },

  // result
  result_h: { en: "Typing Test Result", hi: "टाइपिंग टेस्ट रिज़ल्ट" },
  end_time: { en: "Time up", hi: "समय समाप्त" },
  end_completed: { en: "Passage completed", hi: "पैराग्राफ पूरा" },
  end_ended: { en: "Ended by you", hi: "आपने खत्म किया" },
  net_wpm: { en: "Net WPM", hi: "नेट WPM" },
  gross_wpm: { en: "Gross WPM", hi: "ग्रॉस WPM" },
  correct_chars: { en: "Correct Characters", hi: "सही अक्षर" },
  incorrect_chars: { en: "Incorrect Characters", hi: "गलत अक्षर" },
  corrected: { en: "Mistakes Corrected", hi: "सुधारी गई गलतियाँ" },
  your_perf: { en: "Your Performance", hi: "आपका प्रदर्शन" },
  correct: { en: "Correct", hi: "सही" },
  wrong: { en: "Wrong", hi: "गलत" },
  speed: { en: "Speed", hi: "स्पीड" },
  speed_graph: { en: "Speed Over Time", hi: "समय के साथ स्पीड" },
  speed_graph_note: { en: "WPM over the previous 5 seconds (line) and your running average (dashed).", hi: "पिछले 5 सेकंड की WPM (लाइन) और अब तक की औसत (डैश लाइन)।" },
  seconds: { en: "seconds", hi: "सेकंड" },
  error_analysis: { en: "Error Analysis", hi: "गलतियों का विश्लेषण" },
  expected: { en: "Expected", hi: "सही शब्द" },
  typed: { en: "Typed", hi: "आपने लिखा" },
  no_errors: { en: "No mistakes — excellent!", hi: "कोई गलती नहीं — बहुत बढ़िया!" },
  word_analysis: { en: "Word Analysis", hi: "शब्दों का विश्लेषण" },
  w_correct: { en: "Correct words", hi: "सही शब्द" },
  w_incorrect: { en: "Incorrect words", hi: "गलत शब्द" },
  w_missed: { en: "Missed words", hi: "छूटे शब्द" },
  w_extra: { en: "Extra words", hi: "अतिरिक्त शब्द" },
  char_errors: { en: "Most common character mistakes", hi: "अक्षरों की आम गलतियाँ" },
  typed_instead: { en: "typed", hi: "की जगह" },
  missing: { en: "(missing)", hi: "(छूटा)" },
  extra: { en: "(extra)", hi: "(अतिरिक्त)" },
  more_errors: { en: "more", hi: "और" },
  integrity: { en: "Exam integrity notes", hi: "परीक्षा से जुड़ी सूचना" },
  paste_attempts: { en: "Paste/cut attempts", hi: "पेस्ट/कट की कोशिश" },
  large_inserts: { en: "Large insertions", hi: "एक साथ डाला गया टेक्स्ट" },
  tab_switches: { en: "Tab switches", hi: "टैब बदले" },
  share: { en: "Share", hi: "शेयर करें" },
  copy: { en: "Copy Result", hi: "रिज़ल्ट कॉपी करें" },
  copied: { en: "Result copied", hi: "रिज़ल्ट कॉपी हो गया" },
  copy_failed: { en: "Could not copy — please select and copy the text manually.", hi: "कॉपी नहीं हो सका — टेक्स्ट को खुद चुनकर कॉपी करें।" },
  print: { en: "Print Result", hi: "रिज़ल्ट प्रिंट करें" },
  download: { en: "Download Result", hi: "रिज़ल्ट डाउनलोड करें" },
  try_again: { en: "Try Again", hi: "फिर से शुरू करें" },
  new_passage: { en: "New Passage", hi: "नया पैराग्राफ" },
  back_home: { en: "Back to Typing Practice", hi: "टाइपिंग प्रैक्टिस पर वापस" },
  saved_note: { en: "Saved to My Typing Progress.", hi: "मेरी टाइपिंग प्रगति में सेव हो गया।" },

  // performance levels
  lvl_excellent: { en: "Excellent", hi: "उत्कृष्ट" },
  lvl_veryGood: { en: "Very Good", hi: "बहुत अच्छा" },
  lvl_good: { en: "Good", hi: "अच्छा" },
  lvl_average: { en: "Average", hi: "औसत" },
  lvl_needsPractice: { en: "Needs Practice", hi: "और अभ्यास चाहिए" },
  mot_excellent: { en: "Excellent! Your typing speed is outstanding.", hi: "बहुत बढ़िया! आपकी typing speed शानदार है।" },
  mot_veryGood: { en: "Very good! Keep this pace and focus on accuracy.", hi: "बहुत अच्छा! यही रफ़्तार बनाए रखें और accuracy पर ध्यान दें।" },
  mot_good: { en: "Good progress! A little more practice will improve both speed and accuracy.", hi: "अच्छी प्रगति! थोड़ा और अभ्यास करें, speed और accuracy दोनों बेहतर होंगी।" },
  mot_average: { en: "You're on the right track. Practise daily and your speed will rise steadily.", hi: "आप सही रास्ते पर हैं। रोज़ अभ्यास करें, speed धीरे-धीरे बढ़ती जाएगी।" },
  mot_needsPractice: { en: "No problem. Practise 10 minutes a day and your speed will grow step by step.", hi: "कोई बात नहीं। रोज़ 10 मिनट अभ्यास करें, धीरे-धीरे speed बढ़ेगी।" },
  mot_accuracy: { en: "Tip: slow down slightly — accuracy below 90% costs more than it gains.", hi: "सुझाव: थोड़ा धीरे टाइप करें — 90% से कम सटीकता से नुकसान ज़्यादा होता है।" },

  // SEO + FAQ
  seo_h2: { en: "Practice English and Hindi typing online", hi: "ऑनलाइन अंग्रेज़ी और हिंदी टाइपिंग का अभ्यास" },
  seo_p1: {
    en: "Typing tests are part of many recruitment exams — SSC, court and office assistant posts, stenographer exams and state-level clerical exams. TET Test Hub's typing practice lets you prepare in the same formats: English, Hindi Unicode (Inscript or phonetic), Mangal and Krutidev. Every test shows your WPM, net and gross speed, CPM, accuracy and errors, so you know exactly what to improve.",
    hi: "कई सरकारी भर्तियों में टाइपिंग टेस्ट होता है — जैसे SSC, कोर्ट और ऑफ़िस असिस्टेंट, स्टेनोग्राफ़र और राज्य स्तर की लिपिक परीक्षाएँ। TET Test Hub पर आप उसी फॉर्मेट में तैयारी कर सकते हैं: अंग्रेज़ी, हिंदी यूनिकोड (Inscript या फ़ोनेटिक), मंगल और कृतिदेव। हर टेस्ट के बाद आपको WPM, नेट और ग्रॉस स्पीड, CPM, सटीकता और गलतियाँ दिखती हैं, जिससे साफ़ पता चलता है कि कहाँ सुधार करना है।",
  },
  seo_p2: {
    en: "Speed grows with short, regular practice. Ten to fifteen minutes a day, with attention to accuracy first, works better than one long session a week.",
    hi: "स्पीड रोज़ के छोटे अभ्यास से बढ़ती है। हफ़्ते में एक बार लंबे अभ्यास से बेहतर है कि रोज़ दस से पंद्रह मिनट टाइप करें और पहले सटीकता पर ध्यान दें।",
  },
  faq1_q: { en: "How is WPM calculated?", hi: "WPM कैसे निकाली जाती है?" },
  faq1_a: {
    en: "Every 5 characters (including spaces) count as one word. WPM = correct characters ÷ 5 ÷ minutes. Gross WPM uses all typed characters; Net WPM subtracts one word per minute for every uncorrected error.",
    hi: "हर 5 अक्षर (स्पेस सहित) को एक शब्द माना जाता है। WPM = सही अक्षर ÷ 5 ÷ मिनट। ग्रॉस WPM में सभी टाइप किए अक्षर गिने जाते हैं, और नेट WPM में हर बिना सुधारी गलती के लिए प्रति मिनट एक शब्द घटाया जाता है।",
  },
  faq2_q: { en: "Can I practise Hindi typing on my phone?", hi: "क्या मोबाइल पर हिंदी टाइपिंग का अभ्यास कर सकते हैं?" },
  faq2_a: {
    en: "Yes. For Hindi Unicode and Mangal, switch your phone keyboard to Hindi (for example Gboard Hindi). For Krutidev, keep the keyboard in English mode — Krutidev is typed with English keys.",
    hi: "हाँ। हिंदी यूनिकोड और मंगल के लिए फ़ोन का कीबोर्ड हिंदी में कर लें (जैसे Gboard हिंदी)। कृतिदेव के लिए कीबोर्ड English मोड में ही रखें — कृतिदेव English कीज़ से ही टाइप होता है।",
  },
  faq3_q: { en: "What is the difference between Mangal and Krutidev?", hi: "मंगल और कृतिदेव में क्या अंतर है?" },
  faq3_a: {
    en: "Mangal is a Unicode font: the text is real Hindi that works everywhere. Krutidev is an older non-Unicode font that draws Hindi letters on English keys, and it is still used in many typing exams. Choose the one your exam asks for.",
    hi: "मंगल यूनिकोड फ़ॉन्ट है — इसमें लिखा टेक्स्ट असली हिंदी होता है जो हर जगह चलता है। कृतिदेव पुराना नॉन-यूनिकोड फ़ॉन्ट है जो English कीज़ पर हिंदी अक्षर दिखाता है, और अब भी कई टाइपिंग परीक्षाओं में इस्तेमाल होता है। आपकी परीक्षा जो माँगे, वही चुनें।",
  },
  faq4_q: { en: "Are my results saved?", hi: "क्या मेरे रिज़ल्ट सेव होते हैं?" },
  faq4_a: {
    en: "Your results are saved only in this browser on this device. Nothing is sent to a server, and no login is needed.",
    hi: "आपके रिज़ल्ट सिर्फ़ इसी डिवाइस के इस ब्राउज़र में सेव होते हैं। कुछ भी सर्वर पर नहीं भेजा जाता और लॉगिन की ज़रूरत नहीं है।",
  },
};

let langGetter = () => "hi";
export function setLangGetter(fn) {
  langGetter = fn;
}
export function currentLang() {
  const l = langGetter();
  return l === "en" ? "en" : "hi";
}
/** tr("key") → string in the current UI language. */
export function tr(key) {
  const e = STR[key];
  if (!e) return key;
  return e[currentLang()] || e.en;
}
