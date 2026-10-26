/* Shared TET Test Hub account menu for individual exam and typing pages. */
(function () {
  // auth.js and i18n.js also inject this file; two copies fight over the same text and freeze the page.
  if (window.__tthAccountMenuLoaded) return;
  window.__tthAccountMenuLoaded = true;
  let path = window.location.pathname;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  const isHomePage = path === "/" || path === "/index.html";
  // Login page is permanently English-only; do not inject or run the shared language switch there.
  const isLoginPage = path === "/login.html";

  function addTestHeader() {
    // Remove all old top/floating Home shortcuts. Mock tests use the shared bottom taskbar instead.
    document.querySelectorAll(".home-link, .tth-top-home-link, #tthTopHomeLink, #tth-floating-home, .floating-home, .home-icon-button, .home-icon, .home-button, .floating-home-button, .dhome").forEach((link) => link.remove());
    document.querySelectorAll('a[aria-label*="होम"], a[title="होम"], a[aria-label*="home" i], a[title*="home" i]').forEach((link) => {
      if (link.querySelector("svg") && !link.textContent.trim()) link.remove();
    });

    const header = document.querySelector("header.topbar") || document.querySelector(".topbar") || document.querySelector(".hdr .bar") || document.querySelector(".top") || document.querySelector(".tbar");
    if (!header || header.dataset.tthHeaderReady === "true") return;
    header.dataset.tthHeaderReady = "true";

    // On individual exam-paper screens, keep the TET Test Hub brand and Student ID menu,
    // but do not insert a Home link above the test.
    if (!header.matches("header.topbar")) return;
    const left = header.querySelector(".topbar-left") || header;
    let brand = header.querySelector(".tth-header-brand");
    if (!brand) {
      brand = document.createElement("span");
      brand.className = "tth-header-brand";
      brand.textContent = "TET Test Hub";
      const title = left.querySelector("#examTitle, h1");
      if (title) left.insertBefore(brand, title);
      else left.insertBefore(brand, left.firstChild);
    }

    let menu = header.querySelector("#tthStudentAccountMenu");
    if (!menu) {
      menu = document.createElement("details");
      menu.id = "tthStudentAccountMenu";
      menu.className = "tth-student-account-menu";
      menu.innerHTML = `
        <summary id="tthStudentAccountLabel">छात्र ID</summary>
        <div class="tth-student-account-dropdown">
          <a href="/dashboard.html">डैशबोर्ड / Dashboard</a>
          <button type="button" id="tthStudentLogout">लॉगआउट / Logout</button>
        </div>`;
      const title = left.querySelector("#examTitle, h1");
      if (title) left.insertBefore(menu, title);
      else left.appendChild(menu);
    }

    const label = menu.querySelector("#tthStudentAccountLabel");
    const idSource = document.querySelector("[data-student-id], #studentId, #studentID, .student-id, .student-id-value");
    if (idSource && label) {
      const value = idSource.getAttribute("data-student-id") || idSource.textContent.trim();
      if (value) label.textContent = "छात्र ID: " + value.replace(/^छात्र\s*ID\s*:?\s*/i, "");
    }

    if (label && typeof window.getSession === "function" && typeof window.getProfile === "function") {
      Promise.resolve(window.getSession()).then(async (session) => {
        if (!session) return;
        const user = session.user || session.data?.session?.user;
        if (!user?.id) return;
        const profile = await window.getProfile(user.id);
        if (profile?.student_id) label.textContent = "छात्र ID: " + profile.student_id;
      }).catch((error) => console.warn("Unable to load student ID", error));
    }

    const logoutButton = menu.querySelector("#tthStudentLogout");
    if (logoutButton && logoutButton.dataset.bound !== "true") {
      logoutButton.dataset.bound = "true";
      logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "लॉगआउट हो रहा है…";
        try {
          if (typeof window.logout === "function") await window.logout();
          else if (window.supabaseClient?.auth?.signOut) await window.supabaseClient.auth.signOut();
          else if (typeof supabaseClient !== "undefined" && supabaseClient?.auth?.signOut) await supabaseClient.auth.signOut();
        } catch (error) {
          console.error("Logout failed", error);
        }
        window.location.replace("/login.html");
      });
    }
  }

  function installMockBottomNav() {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const isMockTestPage =
      /(?:^|\/)exam-test\.html$/i.test(path) ||
      /(?:^|\/)tet-mock-test-\d+\.html$/i.test(path) ||
      /\/mock-tests\/[^/]+\/test\.html$/i.test(path) ||
      /\/cpct\/(?:index\.html|typing\.html)$/i.test(path) ||
      /\/tet\/(?:index\.html|test\.html)$/i.test(path) ||
      /\/(?:cpct|tet)(?:-mock-test)?(?:-\d+)?\.html$/i.test(path) ||
      path === "/cpct" || path === "/tet" || path === "/mp-cpct-mock-test";
    if (!isMockTestPage || document.getElementById("tthMockBottomNav")) return;

    const style = document.createElement("style");
    style.id = "tth-mock-bottom-nav-style";
    style.textContent = `
      body.tth-has-mock-bottom-nav { padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; }
      #tthMockBottomNav { position:fixed; left:0; right:0; bottom:0; z-index:10000; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; padding:8px 10px calc(8px + env(safe-area-inset-bottom, 0px)); background:#fff; border-top:1px solid #dbe3e8; box-shadow:0 -4px 18px rgba(15,23,42,.12); }
      #tthMockBottomNav a, #tthMockBottomNav button { min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:7px 3px; border:1px solid transparent; border-radius:10px; color:#fff; text-decoration:none; font:700 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif; cursor:pointer; }
      #tthMockBottomNav .tth-nav-icon { font-size:19px; line-height:1; }
      #tthMockBottomNav .tth-nav-home { background:linear-gradient(135deg,#2563eb,#38bdf8); }
      #tthMockBottomNav .tth-nav-mytest { background:linear-gradient(135deg,#7c3aed,#c084fc); }
      #tthMockBottomNav .tth-nav-contact { background:linear-gradient(135deg,#0f9d70,#34d399); }
      #tthMockBottomNav .tth-nav-logout { background:linear-gradient(135deg,#ea580c,#f43f5e); }
      #tthMockBottomNav a:focus-visible, #tthMockBottomNav button:focus-visible { outline:2px solid #0f766e; outline-offset:2px; }
      @media(min-width:900px) { #tthMockBottomNav { left:50%; right:auto; width:min(520px,100%); transform:translateX(-50%); border:1px solid #dbe3e8; border-bottom:0; border-radius:14px 14px 0 0; } }
    `;
    document.head.appendChild(style);
    const nav = document.createElement("nav");
    nav.id = "tthMockBottomNav";
    nav.setAttribute("aria-label", "Test navigation");
    nav.innerHTML = `
      <a class="tth-nav-home" href="/index.html"><span class="tth-nav-icon" aria-hidden="true">⌂</span><span>Home</span></a>
      <a class="tth-nav-mytest" href="/dashboard.html"><span class="tth-nav-icon" aria-hidden="true">▦</span><span>My Test</span></a>
      <a class="tth-nav-contact" href="/contact.html"><span class="tth-nav-icon" aria-hidden="true">✉</span><span>Contact</span></a>
      <button class="tth-nav-logout" type="button" id="tthBottomLogout"><span class="tth-nav-icon" aria-hidden="true">↪</span><span>Logout</span></button>`;
    document.body.appendChild(nav);
    document.body.classList.add("tth-has-mock-bottom-nav");
    const logout = nav.querySelector("#tthBottomLogout");
    logout.addEventListener("click", async () => {
      logout.disabled = true;
      try {
        if (typeof window.logout === "function") await window.logout();
        else if (window.supabaseClient?.auth?.signOut) await window.supabaseClient.auth.signOut();
        else if (typeof supabaseClient !== "undefined" && supabaseClient?.auth?.signOut) await supabaseClient.auth.signOut();
      } catch (error) {
        console.error("Logout failed", error);
      }
      window.location.replace("/login.html");
    });
  }

  function installFolderBottomLogout() {
    const path = window.location.pathname.replace(/\\/+$/, "") || "/";
    const isMockTestPage =
      /(?:^|\\/)exam-test\\.html$/i.test(path) ||
      /(?:^|\\/)tet-mock-test-\\d+\\.html$/i.test(path) ||
      /\\/mock-tests\\/[^/]+\\/test\\.html$/i.test(path) ||
      /\\/cpct\\/(?:index\\.html|typing\\.html)$/i.test(path) ||
      /\\/tet\\/(?:index\\.html|test\\.html)$/i.test(path) ||
      /\\/(?:cpct|tet)(?:-mock-test)?(?:-\\d+)?\\.html$/i.test(path) ||
      path === "/cpct" || path === "/tet" || path === "/mp-cpct-mock-test";
    if (isMockTestPage) return;

    const norm = value => String(value || "").replace(/[\\s\\u00a0]+/g, " ").trim().toLowerCase();
    const homeNames = new Set(["home", "होम"]);
    const myTestNames = new Set(["my test", "मेरे टेस्ट", "माई टेस्ट"]);
    const contactNames = new Set(["contact", "संपर्क", "संपर्क करें", "contact us"]);
    const candidates = Array.from(document.querySelectorAll(
      'nav, footer, [class*="bottom-nav"], [class*="bottom-bar"], [class*="taskbar"], [class*="mobile-nav"], [id*="bottomNav"], [id*="bottom-nav"]'
    ));
    const bar = candidates.find(el => {
      if (el.id === "tthMockBottomNav" || el.querySelector("#tthBottomLogout, #tthFolderBottomLogout")) return false;
      const labels = Array.from(el.querySelectorAll("a, button")).map(node => norm(node.textContent));
      return labels.some(x => homeNames.has(x)) &&
        labels.some(x => myTestNames.has(x)) &&
        labels.some(x => contactNames.has(x));
    });
    if (!bar) return;

    const controls = Array.from(bar.querySelectorAll("a, button"));
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.id = "tthFolderBottomLogout";
    logoutButton.className = "tth-folder-nav-logout";
    const isHindi = controls.some(node => homeNames.has(norm(node.textContent)) && norm(node.textContent) === "होम");
    logoutButton.innerHTML = '<span aria-hidden="true" class="tth-folder-nav-icon">↪</span><span>' + (isHindi ? "लॉगआउट" : "Logout") + '</span>';
    logoutButton.setAttribute("aria-label", isHindi ? "लॉगआउट" : "Logout");

    const style = document.createElement("style");
    style.id = "tth-folder-bottom-logout-style";
    style.textContent = `
      #tthFolderBottomLogout { min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:7px 3px; border:1px solid transparent; border-radius:10px; color:#fff; background:linear-gradient(135deg,#ea580c,#f43f5e); text-decoration:none; font:700 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif; cursor:pointer; }
      #tthFolderBottomLogout .tth-folder-nav-icon { font-size:19px; line-height:1; }
      #tthFolderBottomLogout:focus-visible { outline:2px solid #0f766e; outline-offset:2px; }
    `;
    document.head.appendChild(style);
    const computedDisplay = window.getComputedStyle(bar).display;
    if (computedDisplay === "grid") {
      bar.style.gridTemplateColumns = "repeat(4,minmax(0,1fr))";
    } else {
      bar.style.display = "grid";
      bar.style.gridTemplateColumns = "repeat(4,minmax(0,1fr))";
    }
    bar.appendChild(logoutButton);
    document.body.style.paddingBottom = "calc(78px + env(safe-area-inset-bottom, 0px))";
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      const label = logoutButton.querySelector("span:last-child");
      if (label) label.textContent = isHindi ? "लॉगआउट हो रहा है…" : "Logging out…";
      try {
        if (typeof window.logout === "function") await window.logout();
        else if (window.supabaseClient?.auth?.signOut) await window.supabaseClient.auth.signOut();
        else if (typeof supabaseClient !== "undefined" && supabaseClient?.auth?.signOut) await supabaseClient.auth.signOut();
      } catch (error) {
        console.error("Logout failed", error);
      }
      window.location.replace("/login.html");
    });
  }

  function installStyles() {
    if (document.getElementById("tth-mobile-header-style")) return;
    const style = document.createElement("style");
    style.id = "tth-mobile-header-style";
    style.textContent = `
      .topbar .ttwrap { display:flex; flex-wrap:wrap; align-items:center; }
      header.topbar .topbar-left { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1 1 100%; }
      header.topbar .tth-top-home-link, .hdr .bar .tth-top-home-link, .tbar .tth-top-home-link { display:inline-flex; align-items:center; justify-content:center; padding:5px 7px; border-radius:8px; background:#16856f; border:1px solid #8abbb0; color:#fff; font-size:17px; line-height:1; min-width:30px; min-height:30px; font-weight:800; text-decoration:none; white-space:nowrap; }
      header.topbar .tth-top-home-link:hover, .hdr .bar .tth-top-home-link:hover, .tbar .tth-top-home-link:hover { background:#0f6b5f; }
      .hdr .bar { justify-content:flex-start; flex-wrap:wrap; }
      .tbar { justify-content:space-between !important; }
      .tbar .tth-top-home-link { margin-right:auto; }
      .hdr .bar .logo { margin-right:auto; }
      .tth-header-brand { color:#fff; font-size:16px; font-weight:700; white-space:nowrap; }
      header.topbar .tth-student-account-menu { position:relative; flex:0 0 auto; z-index:1002; color:#fff; font-size:11px; margin-left:37px; margin-top:-3px; width:max-content; max-width:calc(100% - 37px); }
      header.topbar .tth-student-account-menu summary { list-style:none; cursor:pointer; border:1px solid #8abbb0; background:#ffffff18; border-radius:7px; padding:3px 7px; white-space:nowrap; font-weight:700; font-size:11px; line-height:1.25; }
      header.topbar .tth-student-account-menu summary::-webkit-details-marker { display:none; }
      header.topbar .tth-student-account-dropdown { position:absolute; left:0; top:calc(100% + 6px); min-width:180px; display:grid; gap:4px; padding:6px; background:#fff; color:#202020; border:1px solid #ddd; border-radius:10px; box-shadow:0 8px 24px #0003; }
      header.topbar .tth-student-account-dropdown a, header.topbar .tth-student-account-dropdown button { display:block; width:100%; padding:10px 12px; border:0; border-radius:7px; background:#fff; color:#202020; font:inherit; font-size:13px; text-align:left; text-decoration:none; cursor:pointer; }
      header.topbar .tth-student-account-dropdown a:hover, header.topbar .tth-student-account-dropdown button:hover { background:#eee8fb; color:#5b36a8; }
      header.topbar h1 { min-width:0; }
      @media(max-width:600px) {
        header.topbar { padding:7px 10px; gap:5px; }
        header.topbar .topbar-left { gap:7px; }
        header.topbar .tth-header-brand { font-size:15px; } 
        header.topbar .tth-student-account-menu { margin-left:37px; flex-basis:100%; margin-top:-4px; }
        header.topbar .timer { font-size:12px; padding:3px 7px; }
      }`;
    document.head.appendChild(style);
  }


  // Shared language switch for exam, typing, login and account pages.
  const TTH_TEXT = {
    "TET Test Hub":"TET टेस्ट हब","Home":"होम","All Tests":"सभी टेस्ट","Login":"लॉगिन","Register":"रजिस्टर",
    "About":"हमारे बारे में","Contact":"संपर्क करें","My Test":"मेरे टेस्ट","Logout":"लॉगआउट","Welcome back":"वापसी पर स्वागत है",
    "Login to access your TET Test Hub dashboard.":"अपने TET टेस्ट हब डैशबोर्ड में जाने के लिए लॉगिन करें।",
    "Email ID":"ईमेल आईडी","Password":"पासवर्ड","Enter your email ID":"अपनी ईमेल आईडी दर्ज करें",
    "Show":"दिखाएँ","Hide":"छिपाएँ","LOGIN":"लॉगिन","REGISTER":"रजिस्टर",
    "New student?":"नए विद्यार्थी हैं?","Create account":"खाता बनाएँ","Forgot password?":"पासवर्ड भूल गए?",
    "Create your account":"अपना खाता बनाएँ","Register once and use your account for all your tests.":"एक बार रजिस्टर करें और सभी टेस्ट के लिए अपना खाता उपयोग करें।",
    "Full Name":"पूरा नाम","Your full name":"अपना पूरा नाम","Confirm Password":"पासवर्ड की पुष्टि करें",
    "Already registered?":"पहले से रजिस्टर हैं?","Your account is ready to use immediately after registration.":"रजिस्ट्रेशन के बाद आपका खाता तुरंत उपयोग के लिए तैयार है।",
    "Enter the email address linked to your account and we’ll send a secure reset link.":"अपने खाते से जुड़ा ईमेल दर्ज करें; हम सुरक्षित रीसेट लिंक भेजेंगे।",
    "Registered Email":"रजिस्टर्ड ईमेल","SEND RESET LINK":"रीसेट लिंक भेजें","Back to login":"लॉगिन पर वापस जाएँ",
    "Forgot password?":"पासवर्ड भूल गए?","Your full name":"अपना पूरा नाम","Already registered?":"पहले से रजिस्टर हैं?",
    "Checking your access…":"आपकी पहुँच जाँची जा रही है…","Checking your access...":"आपकी पहुँच जाँची जा रही है…",
    "Enter Your Name to Begin":"शुरू करने के लिए अपना नाम दर्ज करें","Your name will appear on your test and result summary.":"आपका नाम टेस्ट और परिणाम में दिखाई देगा।",
    "Continue":"आगे बढ़ें","Instructions":"निर्देश","Please read the instructions carefully":"कृपया निर्देश ध्यान से पढ़ें",
    "General Instructions:":"सामान्य निर्देश:","Choose your default language:":"अपनी डिफ़ॉल्ट भाषा चुनें:",
    "English":"अंग्रेज़ी","I have read and understood the instructions. All computer hardware allotted to me is in proper working condition. I declare that I am not in possession of any prohibited material. I agree that in case of not adhering to the instructions, I shall be liable to disciplinary action.":"मैंने निर्देश पढ़ और समझ लिए हैं। मुझे दिया गया कंप्यूटर सही स्थिति में है। मैं किसी प्रतिबंधित सामग्री के पास न होने की घोषणा करता/करती हूँ और निर्देशों का पालन करने के लिए सहमत हूँ।",
    "I am ready to begin":"मैं शुरू करने के लिए तैयार हूँ","Question Type: MCQ":"प्रश्न का प्रकार: MCQ",
    "View in:":"भाषा देखें:","Question No. 1":"प्रश्न संख्या 1","Mark for Review & Next":"समीक्षा के लिए चिह्नित करें और आगे बढ़ें",
    "Clear Response":"उत्तर हटाएँ","Previous":"पिछला","Save & Next":"सहेजें और आगे बढ़ें",
    "Answered":"उत्तर दिया","Not Answered":"उत्तर नहीं दिया","Not Visited":"नहीं देखा","Marked for Review":"समीक्षा के लिए चिह्नित",
    "SECTION":"खंड","Choose a Question":"प्रश्न चुनें","Submit":"जमा करें","Test Submitted":"टेस्ट जमा हो गया",
    "Score":"अंक","Correct":"सही","Incorrect":"गलत","Unattempted":"अनुत्तरित","Section":"खंड","Total":"कुल",
    "Time Left":"शेष समय","Candidate:":"उम्मीदवार:","Candidate":"उम्मीदवार","Retry":"दोबारा प्रयास करें",
    "Show Tests":"टेस्ट दिखाएँ","Hide Tests":"टेस्ट छिपाएँ","Full Mock Tests":"पूर्ण मॉक टेस्ट",
    "Paper 1":"पेपर 1","Paper 2":"पेपर 2","Exam not found.":"परीक्षा नहीं मिली।","Content coming soon":"सामग्री जल्द उपलब्ध होगी",
    "TET Test Hub":"TET टेस्ट हब","डैशबोर्ड / Dashboard":"डैशबोर्ड","लॉगआउट / Logout":"लॉगआउट",
    "You have not purchased this test.":"आपने यह टेस्ट नहीं खरीदा है।","Could not load this test right now. Please try again in a moment.":"यह टेस्ट अभी लोड नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
    "you@example.com":"आपका@email.com","Passwords do not match.":"पासवर्ड मेल नहीं खाते।","Please enter your name to continue.":"आगे बढ़ने के लिए अपना नाम दर्ज करें।",
    "LOGGING IN...":"लॉगिन हो रहा है…","CREATING ACCOUNT...":"खाता बनाया जा रहा है…","SENDING...":"भेजा जा रहा है…",
    "Passwords do not match.":"पासवर्ड मेल नहीं खाते।","Account created. Please log in.":"खाता बन गया है। कृपया लॉगिन करें।",
    "Already registered?":"पहले से रजिस्टर हैं?","Your account is ready to use immediately after registration.":"रजिस्ट्रेशन के बाद आपका खाता तुरंत उपयोग के लिए तैयार है।",
    "Total duration of examination is":"परीक्षा की कुल अवधि है","minutes (2 Hours 30 Minutes)":"मिनट (2 घंटे 30 मिनट)",
    "The test has":"इस टेस्ट में","questions":"प्रश्न हैं","1 mark per question, no negative marking":"प्रत्येक प्रश्न के लिए 1 अंक, नकारात्मक अंकन नहीं",
    "The clock will be set at the server. The countdown timer will display the remaining time. When the timer reaches zero, the examination will end and auto-submit.":"घड़ी सर्वर के अनुसार चलेगी। टाइमर शेष समय दिखाएगा। समय शून्य होने पर परीक्षा समाप्त होकर अपने आप जमा हो जाएगी।",
    "The Question Palette on the right will show the status of each question using the symbols below:":"दाईं ओर प्रश्न पैलेट नीचे दिए गए चिह्नों से हर प्रश्न की स्थिति दिखाएगा:",
    "You have not visited the question yet.":"आपने अभी तक यह प्रश्न नहीं देखा है।","You have not answered the question.":"आपने इस प्रश्न का उत्तर नहीं दिया है।",
    "You have answered the question.":"आपने इस प्रश्न का उत्तर दिया है।","You have marked the question for review.":"आपने प्रश्न को समीक्षा के लिए चिह्नित किया है।",
    "The \"Mark for Review\" status simply means you would like to look at that question again.":"\"समीक्षा के लिए चिह्नित\" का अर्थ है कि आप इस प्रश्न को फिर से देखना चाहते हैं।",
    "To answer a question, select an option and click \"Save & Next\".":"उत्तर देने के लिए विकल्प चुनें और \"सहेजें और आगे बढ़ें\" पर क्लिक करें।",
    "To deselect a chosen answer, click \"Clear Response\".":"चुना हुआ उत्तर हटाने के लिए \"उत्तर हटाएँ\" पर क्लिक करें।",
    "To change your answer, select another option and click \"Save & Next\".":"उत्तर बदलने के लिए दूसरा विकल्प चुनें और \"सहेजें और आगे बढ़ें\" पर क्लिक करें।",
    "Sections in this test will be displayed as tabs at the top. Questions in a section can be viewed by clicking the section name.":"इस टेस्ट के खंड ऊपर टैब के रूप में दिखेंगे। खंड का नाम चुनकर उसके प्रश्न देखें।",
    "You can navigate between sections and questions anytime during the test, subject to the time constraint.":"समय सीमा के भीतर आप कभी भी खंडों और प्रश्नों के बीच जा सकते हैं।",
    "Marks for correct answer: 1 | Negative Marks: 0":"सही उत्तर के अंक: 1 | गलत उत्तर के अंक: 0",
    "Please enter your email ID and password.":"कृपया ईमेल आईडी और पासवर्ड दर्ज करें।",
    "Incorrect email ID or password.":"ईमेल आईडी या पासवर्ड गलत है।","Something went wrong. Please try again.":"कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
    "Account created successfully.":"खाता सफलतापूर्वक बन गया।","Send reset link":"रीसेट लिंक भेजें",
    "Login isn't available yet. Please try again later.":"लॉगिन अभी उपलब्ध नहीं है। कृपया बाद में फिर प्रयास करें।",
    "Please fill all fields.":"कृपया सभी फ़ील्ड भरें।","Password must be at least 6 characters.":"पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    "This email is already registered. Please login.":"यह ईमेल पहले से रजिस्टर है। कृपया लॉगिन करें।",
    "Unable to create account.":"खाता नहीं बन सका।","Account created. Please check your email to confirm your account.":"खाता बन गया है। पुष्टि के लिए अपना ईमेल देखें।",
    "Please enter the registered email address.":"कृपया रजिस्टर्ड ईमेल दर्ज करें।",
    "Email confirmation isn't available yet. Please try again later.":"ईमेल पुष्टि अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।",
    "Unable to resend the confirmation email.":"पुष्टि ईमेल दोबारा नहीं भेजा जा सका।",
    "Confirmation email sent again. Please check Inbox, Spam and Promotions.":"पुष्टि ईमेल फिर से भेज दिया गया है। इनबॉक्स, स्पैम और प्रमोशन देखें।",
    "Please enter a valid registered email address.":"कृपया मान्य रजिस्टर्ड ईमेल दर्ज करें।",
    "Password reset isn't available yet. Please try again later.":"पासवर्ड रीसेट अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।",
    "Unable to send the reset link.":"रीसेट लिंक नहीं भेजा जा सका।",
    "Reset link sent. Please check your email inbox and spam folder.":"रीसेट लिंक भेज दिया गया है। इनबॉक्स और स्पैम फ़ोल्डर देखें।",
    "General Knowledge":"सामान्य ज्ञान","General Awareness":"सामान्य जागरूकता","Mathematics":"गणित","Reasoning":"तर्कशक्ति",
    "English":"अंग्रेज़ी","Hindi":"हिंदी","Computer Knowledge":"कंप्यूटर ज्ञान","General Science":"सामान्य विज्ञान",
    "General Studies":"सामान्य अध्ययन","Quantitative Aptitude":"मात्रात्मक योग्यता","Current Affairs":"करंट अफेयर्स",
    "MP GK":"मध्यप्रदेश सामान्य ज्ञान","General Hindi":"सामान्य हिंदी","General English":"सामान्य अंग्रेज़ी",
    "Child Development and Pedagogy":"बाल विकास एवं शिक्षाशास्त्र","Social Science":"सामाजिक विज्ञान",
    "Environmental Studies":"पर्यावरण अध्ययन","Teaching Aptitude":"शिक्षण अभिरुचि","Computer Awareness":"कंप्यूटर जागरूकता",
    "सामान्य ज्ञान":"General Knowledge","सामान्य जागरूकता":"General Awareness","गणित":"Mathematics","तर्कशक्ति":"Reasoning",
    "कंप्यूटर ज्ञान":"Computer Knowledge","सामान्य विज्ञान":"General Science","सामान्य अध्ययन":"General Studies",
    "मात्रात्मक योग्यता":"Quantitative Aptitude","करंट अफेयर्स":"Current Affairs","मध्यप्रदेश सामान्य ज्ञान":"MP GK",
    "सामान्य हिंदी":"General Hindi","सामान्य अंग्रेज़ी":"General English","बाल विकास एवं शिक्षाशास्त्र":"Child Development and Pedagogy",
    "सामाजिक विज्ञान":"Social Science","पर्यावरण अध्ययन":"Environmental Studies","शिक्षण अभिरुचि":"Teaching Aptitude","कंप्यूटर जागरूकता":"Computer Awareness",
    "MP CPCT टेस्ट सीरीज़":"MP CPCT Test Series","MP CPCT — पूरी सीरीज़":"MP CPCT — Full Series",
    "पेपर पैटर्न":"Paper Pattern","पेपर शुरू करें":"Start Paper","पेपर":"Paper","टेस्ट सीरीज़":"Test Series",
    "पूरी सीरीज़":"Full Series","अनलॉक करें":"Unlock","फ्री":"Free","जल्द आ रहा है":"Coming Soon",
    "जल्द उपलब्ध होगा":"Coming Soon","सभी पेपर":"All Papers","सिर्फ टाइपिंग":"Typing Only",
    "छात्र ID":"Student ID","डैशबोर्ड":"Dashboard","लॉगआउट":"Logout","संपर्क":"Contact",
    "स्तर चुनें, फिर विषय चुनें। हर विषय में 25 टेस्ट, टेस्ट 1 फ्री।":"Choose a level, then a subject. 25 tests per subject; test 1 is free.",
    "TET — प्राथमिक और माध्यमिक":"TET — Primary and Secondary",
    "प्राथमिक और माध्यमिक":"Primary and Secondary","विषयवार टेस्ट सीरीज़":"Subject-wise Test Series",
    "विषय खोलें":"Open Subject","टेस्ट":"Test","अगला":"Next","शुरू करें":"Start",
    "आपकी पहुँच जाँची जा रही है…":"Checking your access…","पेमेंट खुल रहा है…":"Opening payment…",
    "पेमेंट जाँच रहे हैं…":"Checking payment…","पेमेंट शुरू नहीं हुआ, फिर से कोशिश करें।":"Payment could not start. Please try again.",
    "यह पेपर लॉक है।":"This paper is locked.","यह टेस्ट अभी लोड नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।":"This test could not load. Please try again shortly.",
    "प्रश्न":"Questions","मिनट":"Minutes","अंक":"Marks","सही":"Correct","गलत":"Incorrect","अनुत्तरित":"Unattempted",
    "समय शेष":"Time Left","हिंदी टाइपिंग":"Hindi Typing","अंग्रेज़ी टाइपिंग":"English Typing",
    "कंप्यूटर दक्षता":"Computer Proficiency","अपठित गद्यांश":"Reading Comprehension","तर्कशक्ति":"Reasoning",
    "सामान्य ज्ञान":"General Awareness","गणित":"Mathematics","पहले लॉगिन करें।":"Please log in first.",
    "सीरीज़ अनलॉक है।":"Series unlocked.","सीरीज़ अनलॉक हो गई।":"Series unlocked.",
    "25 पूरे पेपर":"25 full papers","पेपर 1 फ्री।":"Paper 1 is free.",
    "स्तर चुनें":"Choose a level","विषय चुनें":"Choose a subject","प्राथमिक":"Primary","माध्यमिक":"Secondary"
  };
  const TTH_ORIGINALS = new WeakMap();
  let tthObserver = null;
  function tthLang(){
    try{
      const examControl=document.getElementById("langBtn")||document.getElementById("langBtnName")||document.getElementById("langSel");
      return examControl ? (localStorage.getItem("testhub_lang_pref")||localStorage.getItem("tetLang")||"hi") : (localStorage.getItem("tetLang")||"hi");
    }catch(_){return "hi";}
  }
  function tthTranslateNode(node, lang){
    if(!node || node.nodeType!==Node.TEXT_NODE || !node.parentElement) return;
    if(node.parentElement.closest("script,style,textarea,[data-tth-no-translate],option[data-keep-language],[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-alt],#qText,#qtext,#optionsList,#options,.qtext,.rqtext,.rsol,.option")) return;
    let original=TTH_ORIGINALS.get(node);
    if(original===undefined){original=node.nodeValue;TTH_ORIGINALS.set(node,original);}
    const trimmed=original.trim();
    if(!trimmed) return;
    // Prefer the matching half of an explicitly bilingual label such as "हिंदी / English".
    // This lets one switch translate titles and card labels without changing question content.
    const paired=trimmed.split(/\s+[\/|｜]\s+/);
    if(paired.length>1){
      const scoreHindi=x=>(x.match(/[\u0900-\u097F]/g)||[]).length;
      const scoreLatin=x=>(x.match(/[A-Za-z]/g)||[]).length;
      const hiPart=paired.filter(x=>scoreHindi(x)>0).sort((a,b)=>scoreHindi(b)-scoreHindi(a))[0];
      const enPart=paired.filter(x=>scoreLatin(x)>0).sort((a,b)=>scoreLatin(b)-scoreLatin(a))[0];
      // Write only when the text really changes: an equal write still fires the
      // MutationObserver below, which looped forever and froze test pages.
      const part=lang==="hi"&&hiPart&&scoreHindi(hiPart)>=scoreLatin(hiPart)?hiPart:lang==="en"&&enPart&&scoreLatin(enPart)>=scoreHindi(enPart)?enPart:null;
      if(part){ const next=original.replace(trimmed,part); if(node.nodeValue!==next) node.nodeValue=next; return; }
    }
    let translated=trimmed;
    if(lang==="hi"){
      translated=TTH_TEXT[trimmed] || Object.entries(TTH_TEXT).find(([en])=>en.toLowerCase()===trimmed.toLowerCase())?.[1] || trimmed;
      const q=trimmed.match(/^Question No\\.\\s*(\\d+)$/i); if(q) translated="प्रश्न संख्या "+q[1];
      const timer=trimmed.match(/^Time Left\\s*:\\s*(.*)$/i); if(timer) translated="शेष समय : "+timer[1];
      const candidate=trimmed.match(/^Candidate:\\s*(.*)$/i); if(candidate) translated="उम्मीदवार: "+candidate[1];
      const marks=trimmed.match(/^Marks for correct answer:\\s*(\\d+)\\s*\\|\\s*Negative Marks:\\s*(.*)$/i); if(marks) translated="सही उत्तर के अंक: "+marks[1]+" | गलत उत्तर के अंक: "+marks[2];
    } else {
      const reverse=Object.entries(TTH_TEXT).find(([en,hi])=>hi===trimmed || hi.toLowerCase()===trimmed.toLowerCase());
      translated=reverse ? reverse[0] : trimmed;
      const q=trimmed.match(/^प्रश्न संख्या\\s*(\\d+)$/); if(q) translated="Question No. "+q[1];
      const timer=trimmed.match(/^शेष समय\\s*:\\s*(.*)$/); if(timer) translated="Time Left : "+timer[1];
      const candidate=trimmed.match(/^उम्मीदवार:\\s*(.*)$/); if(candidate) translated="Candidate: "+candidate[1];
      const marks=trimmed.match(/^सही उत्तर के अंक:\\s*(\\d+)\\s*\\|\\s*गलत उत्तर के अंक:\\s*(.*)$/); if(marks) translated="Marks for correct answer: "+marks[1]+" | Negative Marks: "+marks[2];
    }
    if(translated!==trimmed){
      const lead=original.match(/^\\s*/)?.[0]||"";
      const trail=original.match(/\\s*$/)?.[0]||"";
      const next=lead+translated+trail;
      if(node.nodeValue!==next) node.nodeValue=next;
    } else if(node.nodeValue!==original && lang!=="hi") {
      node.nodeValue=original;
    }
  }
  function tthApplyLanguage(){
    const lang=tthLang();
    document.documentElement.lang=lang;
    const root=document.body;
    if(root){
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;while((node=walker.nextNode())) tthTranslateNode(node,lang);
      root.querySelectorAll("input[placeholder],button[title],a[title],button[aria-label]").forEach(el=>{
        ["placeholder","title","aria-label"].forEach(attr=>{
          if(!el.hasAttribute(attr)) return;
          const key="data-tth-original-"+attr;
          if(!el.hasAttribute(key)) el.setAttribute(key,el.getAttribute(attr));
          const original=el.getAttribute(key);
          if(lang==="hi") el.setAttribute(attr,TTH_TEXT[original]||original);
          else { const reverse=Object.entries(TTH_TEXT).find(([en,hi])=>hi===original);el.setAttribute(attr,reverse?reverse[0]:original); }
        });
      });
    }
    if(typeof window.applyI18n==="function") window.applyI18n();
    ["langToggle","tthLanguageToggle","langBtn","langBtnName","langBtnResult"].forEach(id=>{
      const btn=document.getElementById(id);
      if(btn) btn.textContent=lang==="hi"?"English":"हिंदी";
    });
    // Keep every test engine's own language preference synchronized with the site.
    try { localStorage.setItem("testhub_lang_pref", lang); } catch (_) {}
    ["defaultLang","qLangSelect","langSel"].forEach(id=>{
      const select=document.getElementById(id);
      if(select && Array.from(select.options).some(o=>o.value===lang) && select.value!==lang){
        select.value=lang;
        if(id==="langSel") select.dispatchEvent(new Event("change",{bubbles:true}));
      }
    });
    if(typeof window.renderQuestion==="function" && document.getElementById("testScreen")?.style.display==="block"){
      try{window.renderQuestion();}catch(_){}
    }
  }
  function installLanguageToggle(){
    let btn=document.getElementById("langToggle")||document.getElementById("tthLanguageToggle")||document.getElementById("langBtn")||document.getElementById("langBtnName")||document.getElementById("langBtnResult");
    if(btn && btn.hidden) btn=null;
    const hadExistingToggle=!!btn;
    if(!btn && !document.getElementById("langSel") && !document.getElementById("languageSwitch")){
      btn=document.createElement("button");btn.type="button";btn.id="tthLanguageToggle";btn.className="tth-language-toggle";
      btn.style.cssText="border:1px solid #8abbb0;background:#fff;color:#155e55;border-radius:8px;padding:6px 10px;font-weight:800;cursor:pointer;white-space:nowrap;";
      const header=document.querySelector("header.topbar .topbar-left")||document.querySelector(".site-header")||document.querySelector(".hdr .bar")||document.querySelector(".tbar")||document.querySelector(".topbar")||document.querySelector("header");
      // Place the language switch immediately beside the student-ID/account control when present.
      const studentControl=document.querySelector("#tthStudentAccountMenu, #studentId, #studentID, .student-id, [data-student-id]");
      if(studentControl && studentControl.parentElement){
        studentControl.insertAdjacentElement("afterend",btn);
      } else if(header){
        header.appendChild(btn);
      } else {
        btn.style.cssText+=";position:fixed;top:12px;right:12px;z-index:99999";
        document.body.appendChild(btn);
      }
    }
    const controls=["langToggle","tthLanguageToggle","langBtn","langBtnName","langBtnResult"].map(id=>document.getElementById(id)).filter(Boolean);
    if(!controls.length && document.getElementById("langSel")) controls.push(document.getElementById("langSel"));
    controls.forEach(control=>{
      if(control.dataset.tthLangBound==="true") return;
      control.dataset.tthLangBound="true";
      control.addEventListener("click",()=>setTimeout(()=>{
        let selected="hi";
        try{
          if(control.id==="tthLanguageToggle" && !hadExistingToggle){
            selected=(localStorage.getItem("tetLang")||"hi")==="hi"?"en":"hi";
          } else if(["langBtn","langBtnName","langBtnResult"].includes(control.id)){
            selected=localStorage.getItem("testhub_lang_pref")||"hi";
          } else {
            selected=localStorage.getItem("tetLang")||"hi";
          }
          localStorage.setItem("tetLang",selected);localStorage.setItem("testhub_lang_pref",selected);
        }catch(_){}
        tthApplyLanguage();
      },0));
      if(control.tagName==="SELECT") control.addEventListener("change",()=>setTimeout(()=>{
        const selected=control.value==="en"?"en":"hi";
        try{localStorage.setItem("tetLang",selected);localStorage.setItem("testhub_lang_pref",selected);}catch(_){}
        tthApplyLanguage();
      },0));
    });
    tthApplyLanguage();
    if(!tthObserver && document.body){
      tthObserver=new MutationObserver(records=>records.forEach(rec=>{
        if(rec.type==="characterData") tthTranslateNode(rec.target,tthLang());
        rec.addedNodes&&rec.addedNodes.forEach(n=>{
          if(n.nodeType===Node.TEXT_NODE)tthTranslateNode(n,tthLang());
          else if(n.nodeType===Node.ELEMENT_NODE){
            const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);let child;
            while((child=w.nextNode()))tthTranslateNode(child,tthLang());
          }
        });
      }));
      tthObserver.observe(document.body,{subtree:true,childList:true});
    }
  }

  function normalizeLanguageControl(){
    const header=document.querySelector("header.topbar")||document.querySelector(".topbar")||document.querySelector(".hdr .bar")||document.querySelector(".site-header")||document.querySelector(".tbar")||document.querySelector("header");
    if(!header) return;
    const left=header.querySelector(".topbar-left")||header.querySelector(".ttwrap")||header.querySelector(".brand")?.parentElement||header;
    const brand=header.querySelector(".tth-header-brand, .brand, .logo, .ttext, a[aria-label*='TETTESTHUB'], a[aria-label*='TET Test Hub']")||left.firstElementChild;
    const account=header.querySelector("#tthStudentAccountMenu, #accountMenu, .top-account-menu, .account-student-id, #accountStudentId");
    let control=header.querySelector("#languageSwitch, .lang-switch, #langToggle, #tthLanguageToggle, #langBtn, #langBtnName, #langBtnResult");
    if(!control) control=document.querySelector("#languageSwitch, .lang-switch, #langToggle, #tthLanguageToggle, #langBtn, #langBtnName, #langBtnResult");
    if(!control) return;
    // Keep the existing functional control; move it to the brand/student-ID area.
    const anchor=account||header.querySelector("#subtitleText")||brand;
    if(anchor && anchor.parentElement){
      // Move only when needed; repeated DOM moves can retrigger page observers.
      if(control.parentElement !== anchor.parentElement || control.previousElementSibling !== anchor){
        anchor.insertAdjacentElement("afterend",control);
      }
    } else if(control.parentElement !== left || control !== left.lastElementChild) {
      left.appendChild(control);
    }
    control.classList.add("tth-language-top");
    control.style.setProperty("display","inline-flex","important");
    control.style.setProperty("align-items","center");
    control.style.setProperty("gap","4px");
    control.style.setProperty("margin","4px 0 0");
    if(header.matches(".topbar") && left.classList.contains("ttwrap")){
      control.style.setProperty("align-self","flex-start");
      control.style.setProperty("font-size","10px");
      control.style.setProperty("padding","2px 7px");
      control.style.setProperty("margin","3px 0 0");
      control.style.setProperty("position","static");
      control.style.setProperty("display","inline-flex","important");
      control.style.setProperty("background","rgba(255,255,255,.14)");
      control.style.setProperty("color","#fff");
      control.style.setProperty("border","1px solid rgba(255,255,255,.4)");
    }
    control.style.setProperty("padding",header.matches(".topbar") && left.classList.contains("ttwrap") ? "2px 7px" : "3px");
    control.style.setProperty("border-radius","8px");
    control.style.setProperty("font-size",header.matches(".topbar") && left.classList.contains("ttwrap") ? "10px" : "11px");
    control.style.setProperty("max-width","max-content");
    control.style.setProperty("flex-shrink","0");
    // Hide extra language controls elsewhere on the page, without hiding test-question language selectors.
    document.querySelectorAll(".lang-switch, #languageSwitch, #langToggle, #tthLanguageToggle, #langBtn, #langBtnName, #langBtnResult").forEach(el=>{
      if(el===control || control.contains(el)) return;
      if(el.closest(".question-language, .question-lang, .q-language, #questionLanguage, .question-palette")) return;
      el.style.setProperty("display","none","important");
    });
  }
  function run() {
    installStyles();
    if (isLoginPage || isHomePage) {
      // Login and the purple public homepage are permanently English-only.
      // Never inject the shared language toggle on either page.
      document.documentElement.lang = "en";
      document.querySelectorAll(".lang-switch, #languageSwitch, #langToggle, #tthLanguageToggle, #langBtn, #langBtnName, #langBtnResult, #langSel, [data-language-toggle]").forEach(el => el.remove());
      return;
    }
    addTestHeader();
    installMockBottomNav();
    installFolderBottomLogout();
    installLanguageToggle();
    // Keep the one Hindi/English switch beside the student ID/header.
    normalizeLanguageControl();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();

  // Some mock-test templates create the old Home shortcut after their first render.
  // Keep it removed even when the question/start screen is rebuilt.
  const removeLegacyHome = () => {
    document.querySelectorAll(".home-link, .tth-top-home-link, #tthTopHomeLink, #tth-floating-home, .floating-home, .home-icon-button, .home-icon, .home-button, .floating-home-button, .dhome").forEach((el) => el.remove());
  };
  if (document.body && !window.__tthLegacyHomeObserver) {
    removeLegacyHome();
    window.__tthLegacyHomeObserver = new MutationObserver(removeLegacyHome);
    window.__tthLegacyHomeObserver.observe(document.body, { childList: true, subtree: true });
  }
})();
