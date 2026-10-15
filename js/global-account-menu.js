/* Shared TET Test Hub account menu for individual exam and typing pages. */
(function () {
  let path = window.location.pathname;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path === "/" || path === "/index.html") return;

  function addTestHeader() {
    // Remove legacy floating house icons across all pages, not only exam headers.
    document.querySelectorAll(".home-link, #tth-floating-home, .floating-home, .home-icon-button, .home-icon, .home-button, .floating-home-button").forEach((link) => link.remove());
    document.querySelectorAll('a[aria-label*="होम"], a[title="होम"], a[aria-label*="home" i], a[title*="home" i]').forEach((link) => {
      if (link.querySelector("svg") && !link.textContent.trim()) link.remove();
    });

    const header = document.querySelector("header.topbar") || document.querySelector(".hdr .bar") || document.querySelector(".tbar");
    if (!header || header.dataset.tthHeaderReady === "true") return;
    header.dataset.tthHeaderReady = "true";

    const isExamTopbar = header.matches("header.topbar");
    const left = header.querySelector(".topbar-left") || header;
    let home = header.querySelector("#tthTopHomeLink");
    if (!home) {
      home = document.createElement("a");
      home.id = "tthTopHomeLink";
      home.className = "tth-top-home-link";
      home.href = "/";
      home.textContent = "⌂";
      home.title = "होम";
      home.setAttribute("aria-label", "होमपेज पर जाएँ");
      const leftSide = header.querySelector(".topbar-left") || header;
      leftSide.insertBefore(home, leftSide.firstChild);
    }

    // CPCT/TET catalogue pages keep the original text Home option.
    // Exam paper headers use the compact house icon only.
    if (!isExamTopbar) {
      home.textContent = "⌂ होम";
      home.href = "/index.html";
      home.title = "होम";
      const logo = header.querySelector("a.logo");
      if (logo) logo.href = "/index.html";
      return;
    }
    home.textContent = "⌂";
    // The live root/index route can show the login landing page; use the separately
    // published homepage copy so exam-paper Home always opens the public homepage.
    home.href = "/examhelp/index.html";
    home.title = "होम";

    let brand = header.querySelector(".tth-header-brand");
    if (!brand) {
      brand = document.createElement("span");
      brand.className = "tth-header-brand";
      brand.textContent = "TET Test Hub";
      if (home && home.parentElement === left) home.insertAdjacentElement("afterend", brand);
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
      if (brand.nextSibling) left.insertBefore(menu, brand.nextSibling);
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
        } catch (error) {
          console.error("Logout failed", error);
        }
        window.location.href = "/login.html";
      });
    }
  }

  function installStyles() {
    if (document.getElementById("tth-mobile-header-style")) return;
    const style = document.createElement("style");
    style.id = "tth-mobile-header-style";
    style.textContent = `
      header.topbar .topbar-left { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1 1 100%; }
      header.topbar .tth-top-home-link, .hdr .bar .tth-top-home-link, .tbar .tth-top-home-link { display:inline-flex; align-items:center; justify-content:center; padding:5px 7px; border-radius:8px; background:#16856f; border:1px solid #8abbb0; color:#fff; font-size:17px; line-height:1; min-width:30px; min-height:30px; font-weight:800; text-decoration:none; white-space:nowrap; }
      header.topbar .tth-top-home-link:hover, .hdr .bar .tth-top-home-link:hover, .tbar .tth-top-home-link:hover { background:#0f6b5f; }
      .hdr .bar { justify-content:flex-start; flex-wrap:wrap; }
      .tbar { justify-content:space-between !important; }
      .tbar .tth-top-home-link { margin-right:auto; }
      .hdr .bar .logo { margin-right:auto; }
      .tth-header-brand { color:#fff; font-size:16px; font-weight:700; white-space:nowrap; }
      header.topbar .tth-student-account-menu { position:relative; flex:0 0 auto; z-index:1002; color:#fff; font-size:12px; }
      header.topbar .tth-student-account-menu summary { list-style:none; cursor:pointer; border:1px solid #8abbb0; background:#ffffff18; border-radius:8px; padding:6px 10px; white-space:nowrap; font-weight:700; }
      header.topbar .tth-student-account-menu summary::-webkit-details-marker { display:none; }
      header.topbar .tth-student-account-dropdown { position:absolute; left:0; top:calc(100% + 6px); min-width:180px; display:grid; gap:4px; padding:6px; background:#fff; color:#202020; border:1px solid #ddd; border-radius:10px; box-shadow:0 8px 24px #0003; }
      header.topbar .tth-student-account-dropdown a, header.topbar .tth-student-account-dropdown button { display:block; width:100%; padding:10px 12px; border:0; border-radius:7px; background:#fff; color:#202020; font:inherit; font-size:13px; text-align:left; text-decoration:none; cursor:pointer; }
      header.topbar .tth-student-account-dropdown a:hover, header.topbar .tth-student-account-dropdown button:hover { background:#eee8fb; color:#5b36a8; }
      header.topbar h1 { min-width:0; }
      @media(max-width:600px) {
        header.topbar { padding:7px 10px; gap:5px; }
        header.topbar .topbar-left { gap:7px; }
        header.topbar .tth-header-brand { font-size:15px; }
        header.topbar .timer { font-size:12px; padding:3px 7px; }
      }`;
    document.head.appendChild(style);
  }


  // Shared language switch for exam, typing, login and account pages.
  const TTH_TEXT = {
    "TET Test Hub":"TET टेस्ट हब","Home":"होम","All Tests":"सभी टेस्ट","Login":"लॉगिन","Register":"रजिस्टर",
    "About":"हमारे बारे में","Contact":"संपर्क करें","Welcome back":"वापसी पर स्वागत है",
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
    "You have not purchased this test.":"आपने यह टेस्ट नहीं खरीदा है।","Could not load this test right now. Please try again in a moment.":"यह टेस्ट अभी लोड नहीं हो सका। कृपया थोड़ी देर बाद पुनः प्रयास करें।"
  };
  const TTH_ORIGINALS = new WeakMap();
  let tthObserver = null;
  function tthLang(){ try{return localStorage.getItem("tetLang") || "hi";}catch(_){return "hi";} }
  function tthTranslateNode(node, lang){
    if(!node || node.nodeType!==Node.TEXT_NODE || !node.parentElement) return;
    if(node.parentElement.closest("script,style,textarea,option[data-keep-language],#qText,#optionsList,.qtext,.option")) return;
    let original=TTH_ORIGINALS.get(node);
    if(original===undefined){original=node.nodeValue;TTH_ORIGINALS.set(node,original);}
    const trimmed=original.trim();
    if(!trimmed) return;
    let translated=trimmed;
    if(lang==="hi"){
      translated=TTH_TEXT[trimmed] || trimmed;
    } else {
      const reverse=Object.entries(TTH_TEXT).find(([en,hi])=>hi===trimmed);
      translated=reverse ? reverse[0] : trimmed;
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
    const btn=document.getElementById("langToggle")||document.getElementById("tthLanguageToggle");
    if(btn) btn.textContent=lang==="hi"?"English":"हिंदी";
    // Keep the complete question paper in the same language as the interface.
    ["defaultLang","qLangSelect"].forEach(id=>{
      const select=document.getElementById(id);
      if(select && Array.from(select.options).some(o=>o.value===lang)) select.value=lang;
    });
    if(typeof window.renderQuestion==="function" && document.getElementById("testScreen")?.style.display==="block"){
      try{window.renderQuestion();}catch(_){}
    }
  }
  function installLanguageToggle(){
    let btn=document.getElementById("langToggle")||document.getElementById("tthLanguageToggle");
    const hadExistingToggle=!!btn;
    if(!btn){
      btn=document.createElement("button");btn.type="button";btn.id="tthLanguageToggle";btn.className="tth-language-toggle";
      btn.style.cssText="border:1px solid #8abbb0;background:#fff;color:#155e55;border-radius:8px;padding:6px 10px;font-weight:800;cursor:pointer;white-space:nowrap;";
      const header=document.querySelector("header.topbar .topbar-left")||document.querySelector(".site-header")||document.querySelector(".hdr .bar")||document.querySelector(".tbar")||document.querySelector("header");
      if(header) header.appendChild(btn); else {btn.style.cssText+=";position:fixed;top:12px;right:12px;z-index:99999";document.body.appendChild(btn);}
    }
    if(btn.dataset.tthLangBound!=="true"){
      btn.dataset.tthLangBound="true";
      // Existing login button calls toggleLang(); apply the page-wide dictionary afterwards.
      btn.addEventListener("click",()=>{setTimeout(()=>{
        if(!hadExistingToggle){
          try{localStorage.setItem("tetLang",tthLang()==="hi"?"en":"hi");}catch(_){}
        }
        tthApplyLanguage();
      },0);});
    }
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
      tthObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
    }
  }

  function run() { installStyles(); addTestHeader(); installLanguageToggle(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
