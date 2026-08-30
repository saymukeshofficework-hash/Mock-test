// Bilingual (Hindi default / English) support for TET Test Hub's marketing pages.
// A small toggle button in the header switches languages; the choice is remembered
// in localStorage and applies across every page. Load this script early (in <head>,
// before other scripts) so t()/getLang() are ready when page scripts build dynamic
// content — then call applyI18n() once after the page's own content is in the DOM.
const I18N_STORAGE_KEY = "tetLang";
let I18N_ONCHANGE = null; // a page may set this to re-render dynamic content on toggle

const I18N_DICT = {
  // ---------- Header / nav / footer (every page) ----------
  nav_home: { hi: "होम", en: "Home" },
  nav_tests: { hi: "सभी टेस्ट", en: "All Tests" },
  nav_login: { hi: "छात्र लॉगिन", en: "Student Login" },
  nav_about: { hi: "हमारे बारे में", en: "About" },
  nav_contact: { hi: "संपर्क करें", en: "Contact" },
  nav_logout: { hi: "लॉगआउट", en: "Logout" },
  footer_tagline: {
    hi: "टीईटी टेस्ट हब — निःशुल्क ब्राउज़िंग, सशुल्क मॉक टेस्ट, शिक्षक पात्रता परीक्षा उम्मीदवारों के लिए।",
    en: "TET Test Hub — free-to-browse, paid mock tests for Teacher Eligibility Test aspirants.",
  },

  // ---------- index.html ----------
  hero_eyebrow: { hi: "20 पूर्ण-लंबाई द्विभाषी मॉक टेस्ट", en: "20 Full-Length Bilingual Mock Tests" },
  hero_tagline: { hi: "तैयारी करें। अभ्यास करें। प्रदर्शन करें।", en: "Prepare. Practice. Perform." },
  hero_cta_free: { hi: "2 मुफ्त टेस्ट आज़माएं", en: "Try 2 Free Tests" },
  hero_cta_login: { hi: "छात्र लॉगिन", en: "Student Login" },

  free_h2: { hi: "🎯 2 पूर्ण टेस्ट से शुरुआत करें — 100% मुफ्त", en: "🎯 Start With 2 Full Tests — 100% Free" },
  free_lead: {
    hi: "न लॉगिन, न भुगतान — बस अपना नाम लिखें और शुरू करें। टेस्ट 01 और टेस्ट 02 दें, देखें आपका प्रदर्शन कैसा रहा, फिर तय करें कि बाकी टेस्ट चाहिए या नहीं।",
    en: "No login, no payment — just enter your name and start. Take Test 01 & Test 02, see exactly how you perform, then decide if you want the rest.",
  },
  free_test1_title: { hi: "टीईटी पूर्ण टेस्ट 01", en: "TET Full Test 01" },
  free_test2_title: { hi: "टीईटी पूर्ण टेस्ट 02", en: "TET Full Test 02" },
  free_test_desc: { hi: "150 प्रश्न · 150 मिनट · द्विभाषी", en: "150 Questions · 150 Minutes · Bilingual" },
  free_badge: { hi: "✅ मुफ्त — लॉगिन की आवश्यकता नहीं", en: "✅ FREE — No login required" },
  free_start1: { hi: "मुफ्त टेस्ट 01 शुरू करें", en: "Start Free Test 01" },
  free_start2: { hi: "मुफ्त टेस्ट 02 शुरू करें", en: "Start Free Test 02" },
  free_upsell: {
    hi: "<strong>मुफ्त टेस्ट में अच्छा प्रदर्शन किया?</strong> <strong>18 और पूर्ण-लंबाई टेस्ट</strong> (टेस्ट 03&ndash;20 — 2700 और प्रश्न) एक बंडल में सिर्फ़ <strong>₹199</strong> में अनलॉक करें।",
    en: "<strong>Performed well on your free tests?</strong> Unlock <strong>18 more full-length tests</strong> (Test 03&ndash;20 — 2700 more questions) in one bundle for just <strong>₹199</strong>.",
  },
  free_unlock_btn: { hi: "18 टेस्ट अनलॉक करें — ₹199", en: "Unlock All 18 Tests — ₹199" },

  about_h2: { hi: "टीईटी मॉक टेस्ट के बारे में", en: "About the TET Mock Tests" },
  about_p1: {
    hi: "टीईटी टेस्ट हब शिक्षक पात्रता परीक्षा के उम्मीदवारों को 20 पूर्ण-लंबाई वाले अभ्यास टेस्ट देता है, जो असली परीक्षा पैटर्न से मेल खाते हैं — बाल विकास एवं शिक्षाशास्त्र, भाषा-1 (अंग्रेज़ी), भाषा-2 (हिंदी), गणित और पर्यावरण अध्ययन में कुल 150 प्रश्न, 150 मिनट में, तुरंत खंड-वार परिणाम के साथ। घर बैठे, अपनी सुविधा से, अंग्रेज़ी या हिंदी में अभ्यास करें।",
    en: "TET Test Hub gives Teacher Eligibility Test aspirants 20 full-length practice tests built to match the real exam pattern — 150 questions across Child Development & Pedagogy, Language-1 (English), Language-2 (Hindi), Mathematics and Environmental Studies, in 150 minutes, with instant section-wise results. Practice at home, on your own schedule, in English or Hindi.",
  },

  benefits_h2: { hi: "यहाँ अभ्यास क्यों करें", en: "Why practice here" },
  benefit1_title: { hi: "असली परीक्षा पैटर्न", en: "Real exam pattern" },
  benefit1_desc: { hi: "5 खंड, 150 प्रश्न, 150 मिनट — बिल्कुल असली टीईटी जैसी संरचना।", en: "5 sections, 150 questions, 150 minutes — the same structure as the actual TET." },
  benefit2_title: { hi: "द्विभाषी प्रश्न", en: "Bilingual questions" },
  benefit2_desc: { hi: "किसी भी प्रश्न को अंग्रेज़ी या हिंदी में, टेस्ट के दौरान कभी भी बदलें।", en: "Switch between English and Hindi for any question, any time during the test." },
  benefit3_title: { hi: "तुरंत परिणाम", en: "Instant results" },
  benefit3_desc: { hi: "सबमिट करते ही अपना स्कोर और खंड-वार विश्लेषण देखें।", en: "See your score and a section-wise breakdown the moment you submit." },
  benefit4_title: { hi: "किसी भी डिवाइस पर चले", en: "Works on any device" },
  benefit4_desc: { hi: "साफ़, तेज़, मोबाइल-फ्रेंडली टेस्ट स्क्रीन — कोई ऐप इंस्टॉल करने की ज़रूरत नहीं।", en: "A clean, fast, mobile-friendly test screen — no app to install." },

  overview_h2: { hi: "20 पूर्ण मॉक टेस्ट", en: "20 Full Mock Tests" },
  overview_lead: { hi: "हर टेस्ट में सभी 5 खंडों के 150 अलग प्रश्न हैं — हर बार एक नया टेस्ट दें।", en: "Every test has its own set of 150 questions across all 5 sections — practice with a fresh test each time." },
  overview_seeall_btn: { hi: "सभी 20 टेस्ट देखें", en: "See All 20 Tests" },
  overview_more_suffix: { hi: "और टेस्ट", en: "more tests" },
  overview_viewall_link: { hi: "सभी देखें →", en: "View all →" },

  pricing_h2: { hi: "मूल्य", en: "Pricing" },
  pricing_lead: { hi: "सरल, एकमुश्त मूल्य। 2 मुफ्त टेस्ट से शुरू करें, फिर सभी 20 को ₹199 में अनलॉक करें।", en: "Simple, one-time pricing. Start free with 2 tests, then unlock all 20 for ₹199." },
  pricing_free_title: { hi: "मुफ्त एक्सेस", en: "Free Access" },
  pricing_free_li1: { hi: "2 पूर्ण मॉक टेस्ट", en: "2 full mock tests" },
  pricing_free_li2: { hi: "टेस्ट 01 और टेस्ट 02", en: "Test 01 & Test 02" },
  pricing_free_li3: { hi: "300 प्रश्न, हर एक 150 मिनट", en: "300 questions, 150 minutes each" },
  pricing_free_li4: { hi: "तुरंत परिणाम", en: "Instant results" },
  pricing_free_btn: { hi: "मुफ्त शुरू करें", en: "Get Started Free" },
  pricing_paid_ribbon: { hi: "18 और टेस्ट", en: "18 More Tests" },
  pricing_paid_title: { hi: "सभी टेस्ट (03-20)", en: "All Tests (03-20)" },
  pricing_paid_li1: { hi: "18 अतिरिक्त टेस्ट", en: "18 additional tests" },
  pricing_paid_li2: { hi: "टेस्ट 03-20", en: "Tests 03-20" },
  pricing_paid_li3: { hi: "कुल 2700 प्रश्न", en: "2700 questions total" },
  pricing_paid_li4: { hi: "हर टेस्ट में तुरंत परिणाम", en: "Instant results, every test" },
  pricing_paid_btn: { hi: "सभी 18 अनलॉक करें", en: "Unlock All 18" },

  faq_h2: { hi: "अक्सर पूछे जाने वाले प्रश्न", en: "Frequently Asked Questions" },
  faq1_q: { hi: "भुगतान के बाद एक्सेस कैसे मिलेगा?", en: "How do I get access after paying?" },
  faq1_a: {
    hi: 'भुगतान के बाद, अपनी भुगतान स्क्रीनशॉट / ऑर्डर विवरण हमें ईमेल पर भेजें — देखें <a href="contact.html">संपर्क पेज</a>। हम भुगतान सत्यापित करके आपको छात्र आईडी और पासवर्ड भेजेंगे ताकि आप लॉगिन कर टेस्ट शुरू कर सकें।',
    en: 'After payment, send your payment screenshot / order details to us by email — see the <a href="contact.html">Contact page</a>. We verify the payment and send your Student ID and password so you can log in and start your test.',
  },
  faq2_q: { hi: "क्या भुगतान स्वतः सत्यापित होता है?", en: "Is payment verified automatically?" },
  faq2_a: { hi: "नहीं — भुगतान की जांच टीईटी टेस्ट हब टीम द्वारा मैन्युअल रूप से की जाती है। भुगतान की पुष्टि होते ही आपका खाता बना कर सक्रिय कर दिया जाता है।", en: "No — payments are verified manually by the TET Test Hub team. Your account is created and enabled shortly after we confirm your payment." },
  faq3_q: { hi: "क्या मैं टेस्ट हिंदी में दे सकता/सकती हूं?", en: "Can I take a test in Hindi?" },
  faq3_a: { hi: "हाँ। हर प्रश्न को अंग्रेज़ी या हिंदी में देखा जा सकता है — टेस्ट के दौरान कभी भी भाषा बदलें।", en: "Yes. Every question can be viewed in English or Hindi — switch languages any time during the test." },
  faq4_q: { hi: "क्या परिणाम तुरंत मिलता है?", en: "Do I get results immediately?" },
  faq4_a: { hi: "हाँ, सबमिट करते ही आपका स्कोर और खंड-वार विश्लेषण दिखाया जाता है।", en: "Yes, your score and a section-wise breakdown are shown the moment you submit the test." },
  faq5_q: { hi: "क्या मैं सभी 18 की बजाय अलग-अलग टेस्ट खरीद सकता/सकती हूं?", en: "Can I buy tests one at a time instead of all 18?" },
  faq5_a: { hi: "नहीं — टेस्ट 03-20 केवल एक साथ ₹199 के बंडल में मिलते हैं, अलग-अलग नहीं। टेस्ट 01 और 02 हमेशा मुफ्त हैं।", en: "No — tests 03-20 are sold together as a single ₹199 bundle, not individually. Tests 01 & 02 are always free." },

  // ---------- tests.html ----------
  tests_h2: { hi: "सभी टीईटी मॉक टेस्ट", en: "All TET Mock Tests" },
  tests_lead: {
    hi: "टेस्ट 01 और 02 सभी छात्रों के लिए <strong>मुफ्त</strong> हैं। टेस्ट 03-20 एक ही ₹199 बंडल में उपलब्ध हैं। हर टेस्ट में 5 खंडों के 150 प्रश्न हैं, द्विभाषी (अंग्रेज़ी/हिंदी), 150 मिनट।",
    en: 'Tests 01 & 02 are <strong>FREE</strong> for all students. Tests 03-20 available in a single ₹199 bundle. Each test has 150 questions across 5 sections, bilingual (English/Hindi), 150 minutes.',
  },
  bundle_ribbon: { hi: "18 अतिरिक्त टेस्ट", en: "18 Additional Tests" },
  bundle_title: { hi: "सभी टेस्ट (03-20)", en: "All Tests (03-20)" },
  bundle_li1: { hi: "18 अतिरिक्त पूर्ण मॉक टेस्ट", en: "18 additional full mock tests" },
  bundle_li2: { hi: "कुल 2700 प्रश्न", en: "2700 questions in total" },
  bundle_li3: { hi: "साथ में 2 मुफ्त टेस्ट (01 और 02)", en: "Plus 2 free tests (01 & 02)" },
  bundle_li4: { hi: "हर टेस्ट में तुरंत परिणाम", en: "Instant results, every test" },
  bundle_btn: { hi: "🔒 अनलॉक हेतु संपर्क करें", en: "🔒 Contact Us to Unlock" },
  card_full_mock: { hi: "पूर्ण मॉक टेस्ट", en: "Full Mock Test" },
  card_questions_suffix: { hi: "प्रश्न", en: "Questions" },
  card_minutes_suffix: { hi: "मिनट", en: "Minutes" },
  card_free_badge: { hi: "✅ मुफ्त", en: "✅ FREE" },
  card_purchased_badge: { hi: "✅ खरीदा गया", en: "✅ Purchased" },
  card_locked_badge: { hi: "🔒 उपलब्ध नहीं", en: "🔒 Not available" },
  card_start_btn: { hi: "टेस्ट शुरू करें", en: "START TEST" },
  card_contact_btn: { hi: "🔒 अनलॉक हेतु संपर्क करें", en: "🔒 CONTACT TO UNLOCK" },

  // ---------- about.html ----------
  about_page_h2: { hi: "टीईटी टेस्ट हब के बारे में", en: "About TET Test Hub" },
  about_page_p1: {
    hi: "टीईटी टेस्ट हब एक ही उद्देश्य से बनाया गया है: शिक्षक पात्रता परीक्षा के उम्मीदवारों को असली परीक्षा जैसी परिस्थितियों में यथार्थवादी, पूर्ण-लंबाई का अभ्यास देना।",
    en: "TET Test Hub was built for one purpose: to give Teacher Eligibility Test aspirants realistic, full-length practice under exam-like conditions.",
  },
  about_page_p2: {
    hi: "हर मॉक टेस्ट असली टीईटी पैटर्न का पालन करता है — बाल विकास एवं शिक्षाशास्त्र, भाषा-1 (अंग्रेज़ी), भाषा-2 (हिंदी), गणित और पर्यावरण अध्ययन में 150 प्रश्न, 150 मिनट में लाइव टाइमर, प्रश्न पैलेट और अंत में तुरंत खंड-वार परिणाम के साथ पूरे होते हैं। हर प्रश्न अंग्रेज़ी या हिंदी में पढ़ा जा सकता है।",
    en: "Every mock test follows the real TET pattern — 150 questions across Child Development & Pedagogy, Language-1 (English), Language-2 (Hindi), Mathematics and Environmental Studies, completed in 150 minutes with a live timer, a question palette, and an instant section-wise result at the end. Every question can be read in English or Hindi.",
  },
  about_page_p3: {
    hi: "हम इसे सरल रखते हैं: टेस्ट 01 और 02 मुफ्त हैं, बाकी 18 टेस्ट एक बंडल में ₹199 में मिलते हैं। भुगतान सत्यापित होते ही आपको छात्र आईडी और पासवर्ड मिल जाता है और आप तुरंत अभ्यास शुरू कर सकते हैं।",
    en: "We keep things simple: Test 01 & 02 are free, and the remaining 18 tests are one ₹199 bundle. Once your payment is verified you get a Student ID and password to log in and start practicing straight away.",
  },

  // ---------- contact.html ----------
  contact_h2: { hi: "संपर्क और भुगतान सहायता", en: "Contact & Payment Support" },
  contact_lead: {
    hi: "भुगतान के बाद, अपने भुगतान विवरण (स्क्रीनशॉट या ऑर्डर आईडी) के साथ हमसे संपर्क करें ताकि आपको छात्र आईडी और पासवर्ड मिल सके। हम हर भुगतान की मैन्युअल जांच करते हैं, इसलिए विवरण भेजने के बाद कृपया थोड़ा समय दें।",
    en: "After payment, contact us with your payment details (screenshot or order ID) to receive your Student ID and Password. We verify each payment manually, so please allow some time after sending your details.",
  },
  contact_email_label: { hi: "ईमेल:", en: "Email:" },
  contact_coming_soon: { hi: "जल्द आ रहा है", en: "Coming soon" },

  // ---------- login.html ----------
  login_h1: { hi: "छात्र लॉगिन", en: "Student Login" },
  login_sub: { hi: "भुगतान के बाद प्राप्त छात्र आईडी और पासवर्ड से लॉगिन करें।", en: "Log in with the Student ID and password you received after purchase." },
  login_studentid_label: { hi: "छात्र आईडी", en: "Student ID" },
  login_studentid_placeholder: { hi: "उदा. TET26001", en: "e.g. TET26001" },
  login_password_label: { hi: "पासवर्ड", en: "Password" },
  login_btn: { hi: "लॉगिन", en: "LOGIN" },
  login_btn_loading: { hi: "लॉगिन हो रहा है…", en: "Logging in…" },
  login_note: {
    hi: 'लॉगिन जानकारी नहीं है? <a href="tests.html">टेस्ट खरीदें</a> और भुगतान के बाद <a href="contact.html">हमसे संपर्क करें</a>।',
    en: 'Don\'t have login credentials? <a href="tests.html">Purchase a test</a> and <a href="contact.html">contact us</a> after payment.',
  },

  // ---------- dashboard.html ----------
  dash_loading: { hi: "आपका डैशबोर्ड लोड हो रहा है…", en: "Loading your dashboard…" },
  dash_welcome: { hi: "स्वागत है,", en: "Welcome," },
  dash_studentid: { hi: "छात्र आईडी:", en: "Student ID:" },
  dash_logout: { hi: "लॉगआउट", en: "Logout" },
  dash_disabled: {
    hi: 'आपका खाता फ़िलहाल निष्क्रिय है। कृपया सहायता के लिए <a href="contact.html">संपर्क पेज</a> देखें।',
    en: 'Your account is currently disabled. Please contact support — see the <a href="contact.html">Contact page</a>.',
  },
  dash_mytests_h2: { hi: "मेरे टेस्ट", en: "My Tests" },
  dash_mytests_note: { hi: "परिणाम हर टेस्ट के अंत में दिखाए जाते हैं — फिलहाल इन्हें बाद में देखने के लिए सहेजा नहीं जाता।", en: "Results are shown at the end of each test — they aren't saved for later viewing yet." },
  dash_no_package: { hi: "कोई पैकेज असाइन नहीं", en: "No package assigned" },
  dash_could_not_load: {
    hi: 'आपका खाता लोड नहीं हो सका। कृपया सहायता के लिए संपर्क पेज देखें।',
    en: "We could not load your account. Please contact support — see the Contact page.",
  },
  dash_start_btn: { hi: "✅ टेस्ट शुरू करें", en: "✅ START TEST" },
  dash_buy_btn: { hi: "🔒 सभी 18 अनलॉक करें", en: "🔒 BUY ALL 18" },
  dash_student_fallback: { hi: "छात्र", en: "Student" },

  // ---------- js/auth.js error messages ----------
  auth_err_missing: { hi: "कृपया अपनी छात्र आईडी और पासवर्ड दर्ज करें।", en: "Please enter your Student ID and password." },
  auth_err_unavailable: { hi: "लॉगिन अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।", en: "Login isn't available yet. Please try again later." },
  auth_err_invalid: { hi: "गलत छात्र आईडी या पासवर्ड। कृपया जांचकर पुनः प्रयास करें।", en: "Incorrect Student ID or password. Please check and try again." },
  auth_err_generic: { hi: "कुछ गलत हो गया। कृपया थोड़ी देर में पुनः प्रयास करें।", en: "Something went wrong. Please try again in a moment." },
};

function getLang() {
  return localStorage.getItem(I18N_STORAGE_KEY) || "hi";
}

function t(key) {
  const entry = I18N_DICT[key];
  if (!entry) return key;
  return entry[getLang()] || entry.hi || entry.en || key;
}

function applyI18n() {
  const lang = getLang();
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });

  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = lang === "hi" ? "EN" : "हिं";
}

function setLang(lang) {
  localStorage.setItem(I18N_STORAGE_KEY, lang);
  applyI18n();
  if (typeof I18N_ONCHANGE === "function") I18N_ONCHANGE();
}

function toggleLang() {
  setLang(getLang() === "hi" ? "en" : "hi");
}
