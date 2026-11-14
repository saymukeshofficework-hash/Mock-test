// Marks the page as "inside the Android app" so selling UI is hidden (Google Play billing policy).
(function () {
  try {
    var k = "tth-app";
    if (/[?&]source=android/.test(location.search) || /^android-app:/.test(document.referrer)) localStorage.setItem(k, "1");
    if (localStorage.getItem(k) === "1") document.documentElement.setAttribute("data-app", "1");
  } catch (e) {}
  // Pure sales pages: send app users to the catalogue home instead.
  var sales = ["/examhelp/mp-high-court-assistant-grade-3-notes", "/examhelp/mp-high-court-assistant-grade-3-test-series"];
  if (document.documentElement.getAttribute("data-app") && sales.some(function (p) { return location.pathname.indexOf(p) === 0; })) location.replace("/examhelp/");
  // One-time star rating popup, app only, ~2.5s after launch.
  try {
    var rk = "tth-rated";
    if (document.documentElement.getAttribute("data-app") && !localStorage.getItem(rk)) {
      window.addEventListener("load", function () { setTimeout(showRate, 2500); });
    }
  } catch (e) {}
  // Saves the rating to Supabase table app_ratings (insert-only for the public; owner reads it in Supabase).
  // Public anon key, same one LoginChip.tsx uses.
  var SB = "https://ovaubhekxjtkodkhsybg.supabase.co", SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s";
  function saveRating(n) {
    var u = {};
    try { u = JSON.parse(localStorage.getItem("tth_user") || "{}") || {}; } catch (e) {}
    try {
      fetch(SB + "/rest/v1/app_ratings", {
        method: "POST",
        headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ stars: n, name: String(u.name || "Guest").slice(0, 100) })
      }).catch(function () {});
    } catch (e) {}
  }
  function showRate() {
    try { if (localStorage.getItem(rk)) return; localStorage.setItem(rk, "shown"); } catch (e) { return; }
    var css = "#tth-rate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,20,50,.55);opacity:0;transition:opacity .3s}" +
      "#tth-rate.on{opacity:1}#tth-rate .bx{position:relative;background:#fff;color:#163377;border-radius:18px;padding:24px 20px 18px;max-width:340px;width:100%;text-align:center;font-family:inherit;box-shadow:0 12px 40px rgba(0,0,0,.3);transform:scale(.7);transition:transform .35s cubic-bezier(.2,1.4,.4,1)}" +
      "#tth-rate.on .bx{transform:scale(1)}#tth-rate h3{margin:0 0 4px;font-size:19px}#tth-rate p{margin:0 0 14px;font-size:13px;color:#555}" +
      "#tth-rate .st{display:flex;justify-content:center;gap:6px}#tth-rate .st button{background:none;border:0;padding:2px;font-size:38px;line-height:1;color:#cfd6e4;cursor:pointer;opacity:0;transform:scale(.3);animation:tthpop .4s forwards}" +
      "#tth-rate .st button.f{color:#f5b301;transform:scale(1.15)}#tth-rate .x{position:absolute;top:6px;right:10px;background:none;border:0;font-size:22px;color:#888;cursor:pointer}" +
      "#tth-rate .later{margin-top:12px;background:none;border:0;color:#666;font-size:13px;text-decoration:underline;cursor:pointer}" +
      "@keyframes tthpop{60%{opacity:1;transform:scale(1.3)}100%{opacity:1;transform:scale(1)}}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var o = document.createElement("div"); o.id = "tth-rate";
    o.innerHTML = '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="tth-rate-h"><button class="x" aria-label="Close / बंद करें">&times;</button>' +
      '<h3 id="tth-rate-h">आप हमें कितने star देना चाहेंगे?</h3><p>How many stars would you give us?</p><div class="st"></div>' +
      '<button class="later">बाद में / Later</button></div>';
    var row = o.querySelector(".st"), stars = [];
    for (var i = 1; i <= 5; i++) {
      var b = document.createElement("button"); b.textContent = "\u2605"; b.setAttribute("aria-label", i + " star");
      b.style.animationDelay = (0.25 + i * 0.09) + "s"; b.dataset.n = i; row.appendChild(b); stars.push(b);
    }
    function fill(n) { stars.forEach(function (s, j) { s.classList.toggle("f", j < n); }); }
    function close() { o.classList.remove("on"); setTimeout(function () { o.remove(); }, 300); }
    row.addEventListener("mouseover", function (e) { if (e.target.dataset.n) fill(+e.target.dataset.n); });
    row.addEventListener("click", function (e) {
      var n = +e.target.dataset.n; if (!n) return;
      fill(n); try { localStorage.setItem(rk, String(n)); } catch (x) {}
      saveRating(n);
      var bx = o.querySelector(".bx");
      if (n >= 4) {
        bx.innerHTML = '<h3>धन्यवाद! 🙏</h3><p>Thank you! Please rate us on Play Store.<br>कृपया Play Store पर रेटिंग दें।</p>';
        setTimeout(function () { location.href = "market://details?id=in.tettesthub.app"; close(); }, 900);
      } else {
        bx.innerHTML = '<h3>धन्यवाद! 🙏</h3><p>हम और बेहतर करेंगे। सुझाव के लिए Contact पेज पर लिखें।<br>Thanks! We will improve. Share feedback on our Contact page.</p>';
        setTimeout(close, 2600);
      }
    });
    o.querySelector(".x").onclick = close; o.querySelector(".later").onclick = close;
    o.addEventListener("click", function (e) { if (e.target === o) close(); });
    document.body.appendChild(o);
    requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add("on"); }); });
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/examhelp/sw.js", { scope: "/examhelp/" }).catch(function () {});
    });
  }
  // Daily alerts (Web Push): small popup on first visit; "Yes" asks the browser for permission. Asks again after 3 days if closed.
  var PUSH_KEY = "BDRIthDF0G3luX_-8wjFpsuUW9u0pj0JE5eVbAR3lT8RACdQwRm42TRHMHBcJl9oRxN-K6G2YtcatqWrAr6-SBw";
  var CA_FN = "https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/ca-push", CA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";
  function pushCall(body) {
    return fetch(CA_FN, { method: "POST", headers: { apikey: CA_ANON, Authorization: "Bearer " + CA_ANON, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }
  function pushKey() {
    var b = PUSH_KEY.replace(/-/g, "+").replace(/_/g, "/"), s = atob(b + "===".slice((b.length + 3) % 4));
    return Uint8Array.from(s, function (c) { return c.charCodeAt(0); });
  }
  function pushLang() { try { return localStorage.getItem("testhub_lang_pref") === "en" ? "en" : "hi"; } catch (e) { return "hi"; } }
  function pushSubscribe(welcome) {
    return navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: pushKey() }); });
    }).then(function (sub) {
      return pushCall({ action: "subscribe", subscription: sub.toJSON(), lang: pushLang() }).then(function () {
        if (welcome) pushCall({ action: "test", endpoint: sub.endpoint });
      });
    }).catch(function () {});
  }
  function showPushAsk() {
    if (document.getElementById("tth-push")) return;
    // If the first-launch rating card is open, wait and show the push opt-in afterwards.
    if (document.getElementById("tth-rate")) { setTimeout(showPushAsk, 800); return; }
    var st = document.createElement("style");
    st.textContent = "#tth-push{position:fixed;left:12px;right:12px;bottom:12px;z-index:99998;max-width:380px;margin:0 auto;background:#fff;color:#163377;border-radius:16px;padding:16px;box-shadow:0 10px 36px rgba(0,0,0,.28);font-family:inherit;transform:translateY(140%);transition:transform .35s ease}" +
      "#tth-push.on{transform:none}#tth-push b{display:block;font-size:16px;margin-bottom:2px}#tth-push p{margin:0 0 12px;font-size:13px;color:#555}" +
      "#tth-push .r{display:flex;gap:8px;justify-content:flex-end}#tth-push button{border:0;border-radius:10px;padding:9px 14px;font-size:14px;cursor:pointer}" +
      "#tth-push .y{background:#163377;color:#fff;font-weight:600}#tth-push .n{background:#eef1f7;color:#163377}";
    document.head.appendChild(st);
    var o = document.createElement("div"); o.id = "tth-push"; o.setAttribute("role", "dialog");
    o.innerHTML = "<b>🔔 रोज़ की सूचना पाएँ?</b><p>हर सुबह नए करेंट अफेयर्स, नई टेस्ट सीरीज़ और अपडेट की सूचना।<br>Get alerts for daily current affairs, new test series and updates.</p>" +
      '<div class="r"><button class="n">Later</button><button class="y">Allow</button></div>';
    function close() { o.classList.remove("on"); setTimeout(function () { o.remove(); }, 400); }
    o.querySelector(".n").onclick = function () { try { localStorage.setItem("tth-push-later", String(Date.now())); } catch (e) {} close(); };
    o.querySelector(".y").onclick = function () {
      Notification.requestPermission().then(function (p) {
        if (p === "granted") { close(); pushSubscribe(true); return; }
        o.querySelector("p").innerHTML = "Chrome ने सूचना रोक दी है। ऊपर 🔒 पर टैप करें → Permissions → Notifications → Allow.<br>Chrome blocked it. Tap 🔒 in the address bar → Permissions → Notifications → Allow.";
        o.querySelector(".y").remove();
      });
    };
    document.body.appendChild(o);
    requestAnimationFrame(function () { requestAnimationFrame(function () { o.classList.add("on"); }); });
  }
  try {
    if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
      window.addEventListener("load", function () {
        if (Notification.permission === "granted") { // re-save the subscription once a day
          var d = new Date().toDateString();
          if (localStorage.getItem("tth-push-sync") !== d) { localStorage.setItem("tth-push-sync", d); pushSubscribe(false); }
          return;
        }
        if (Notification.permission !== "default") return;
        // Small card with an Allow button: a tap is needed, Chrome on phones often hides prompts asked without one.
        var later = +(localStorage.getItem("tth-push-later") || 0);
        if (Date.now() - later < 864e5) return;
        setTimeout(showPushAsk, 3000);
      });
    }
  } catch (e) {}
})();
