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
})();
