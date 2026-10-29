/* Laptop-only single-row header for static exam pages (CPCT, TET, Typing Practice).
   Matches examhelp DesktopExamHeader. Phone layout is untouched (min-width: 1024px only).
   Usage: <script src="/js/desktop-exam-header.js" data-hide=".hdr"></script>
   data-hide = the page's own header, hidden on laptop only. */
(function () {
  if (window.__tthDesktopHeader) return;
  window.__tthDesktopHeader = true;
  var script = document.currentScript;
  var hide = (script && script.getAttribute("data-hide")) || "";
  var AUTH = "sb-ovaubhekxjtkodkhsybg-auth-token";

  var css =
    ".tth-dh{display:none}" +
    "@media (min-width:1024px){" +
    ".tth-dh{display:block;position:sticky;top:0;z-index:60;padding:8px 16px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Devanagari',sans-serif}" +
    (hide ? hide + "{display:none!important}" : "") +
    "body.tp-in-test .tth-dh{display:none}}" +
    ".tth-dh-bar{max-width:1280px;margin:0 auto;display:flex;height:68px;align-items:center;gap:8px;border:1px solid #a5b4fc;border-radius:16px;padding:0 12px;color:#fff;box-shadow:0 10px 15px -3px rgba(0,0,0,.1);background:linear-gradient(to right,#3730a3,#6d28d9,#a21caf)}" +
    ".tth-dh a{text-decoration:none;color:inherit}" +
    ".tth-dh-logo{display:flex;align-items:center;gap:10px;padding:4px 6px;border-radius:8px;flex-shrink:0}.tth-dh-logo:hover{background:rgba(255,255,255,.1)}" +
    ".tth-dh-logo b{font-size:24px;font-weight:800;letter-spacing:-.4px;color:#fff}.tth-dh-logo b span{color:#c2791c}" +
    ".tth-dh-nav{display:flex;gap:6px;flex-shrink:0}" +
    ".tth-dh-btn{display:inline-flex;height:36px;align-items:center;gap:6px;white-space:nowrap;border-radius:8px;border:1px solid rgba(255,255,255,.3);padding:0 10px;font-size:12px;font-weight:700;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05);cursor:pointer;font-family:inherit;transition:transform .15s,filter .15s}" +
    ".tth-dh-btn:hover{transform:translateY(-1px);filter:brightness(1.1)}" +
    ".tth-dh-right{margin-left:auto;display:flex;align-items:center;gap:6px;flex-shrink:0}" +
    ".tth-dh-lang{display:inline-flex;height:36px;align-items:center;border-radius:8px;border:1px solid rgba(255,255,255,.7);background:#fff;padding:2px}" +
    ".tth-dh-lang button{height:28px;border:0;border-radius:6px;padding:0 8px;font-size:12px;font-weight:600;background:none;color:#1e1b4b;cursor:pointer;font-family:inherit}" +
    ".tth-dh-lang button:hover{background:#e0e7ff}.tth-dh-lang button[aria-pressed=true]{background:#4338ca;color:#fff}" +
    ".tth-dh-id{position:relative}" +
    ".tth-dh-id>a,.tth-dh-id>button{display:inline-flex;height:36px;max-width:240px;align-items:center;overflow:hidden;border-radius:8px;border:1px solid #fde68a;background:#fcd34d;padding:0 10px;font-size:12px;font-weight:600;color:#1e1b4b;cursor:pointer;font-family:inherit;text-align:left}" +
    ".tth-dh-id>button:hover,.tth-dh-id>a:hover{background:#fde68a}" +
    ".tth-dh-id small{display:block;font-size:10px;font-weight:500;opacity:.8}.tth-dh-id strong{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".tth-dh-menu{position:absolute;right:0;top:100%;margin-top:8px;min-width:150px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:6px;box-shadow:0 10px 15px -3px rgba(0,0,0,.15);z-index:70}" +
    ".tth-dh-menu a,.tth-dh-menu button{display:block;width:100%;text-align:left;border:0;background:none;border-radius:8px;padding:8px 12px;font-size:14px;color:#374151;cursor:pointer;font-family:inherit}" +
    ".tth-dh-menu button{color:#b91c1c;font-weight:600}.tth-dh-menu a:hover{background:#ecfdf5}.tth-dh-menu button:hover{background:#fef2f2}";

  var ICON = {
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></svg>',
    out: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>'
  };
  var MARK = '<svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#0f6b5f"/><path d="M8 13.5c4.2-1.4 8.2-.9 12 1.6v15c-3.8-2.5-7.8-3-12-1.6v-15Z" fill="#fff" opacity=".95"/><path d="M32 13.5c-4.2-1.4-8.2-.9-12 1.6v15c3.8-2.5 7.8-3 12-1.6v-15Z" fill="#fff" opacity=".78"/><circle cx="29.5" cy="11" r="6.5" fill="#c2791c" stroke="#0f6b5f" stroke-width="2"/><path d="m26.8 11.1 1.9 1.9 3.6-3.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lang() { var v = get("tetLang") || get("testhub_lang_pref"); return v === "en" ? "en" : "hi"; }

  async function signOut() {
    try {
      if (typeof window.logout === "function") await window.logout();
    } catch (e) { /* clear this browser session anyway */ }
    try { localStorage.removeItem(AUTH); localStorage.removeItem("tth_user"); } catch (e) {}
    window.location.href = "/login.html";
  }

  function identity() {
    var user = null;
    try {
      var sess = get(AUTH);
      if (sess) {
        var cached = JSON.parse(get("tth_user") || "null") || {};
        var meta = (JSON.parse(sess).user || {}).user_metadata || {};
        user = { id: cached.id, name: cached.name || meta.full_name };
      }
    } catch (e) { user = null; }
    if (!user) return '<a href="/login.html" aria-label="Login or register">Login / Register</a>';
    var first = String(user.name || user.id || "").trim().split(/\s+/)[0];
    return '<button type="button" aria-haspopup="menu" aria-expanded="false" data-dh-id><span><small>स्वागत है 👋</small><strong>' +
      esc(first || "मेरा खाता") + (user.id ? " · " + esc(user.id) : "") + '</strong></span></button>' +
      '<div class="tth-dh-menu" role="menu" hidden><a role="menuitem" href="/dashboard.html">डैशबोर्ड / Dashboard</a>' +
      '<button role="menuitem" type="button" data-dh-logout>लॉगआउट / Logout</button></div>';
  }

  function setLang(value) {
    // Prefer the live exam's language controls; changing them must re-render the question.
    var questionLang = document.getElementById("qLangSelect");
    var defaultLang = document.getElementById("defaultLang");
    // CPCT/TET headers have their own हिंदी/English buttons that translate the page.
    var pageBtn = document.querySelector('[data-tth-lang="' + value + '"]');
    // Older pages expose a flip toggle; it reads the current language, so storage must not change first.
    var toggle = document.getElementById("langToggle") || document.getElementById("tthLanguageToggle");
    var useToggle = !pageBtn && toggle && !questionLang && !defaultLang && lang() !== value;
    if (!useToggle) {
      try { localStorage.setItem("tetLang", value); localStorage.setItem("testhub_lang_pref", value); } catch (e) {}
    }
    if (questionLang && questionLang.value !== value) {
      questionLang.value = value;
      questionLang.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (defaultLang) defaultLang.value = value;
    if (pageBtn) pageBtn.click();
    else if (useToggle) toggle.click();
    else if (typeof window.setLang === "function") {
      try { window.setLang(value); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent("tth:languagechange", { detail: { lang: value } }));
  }

  function run() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    var el = document.createElement("div");
    el.className = "tth-dh";
    // Header labels stay English; the shared page translator must not touch them.
    el.setAttribute("data-tth-no-translate", "true");
    el.innerHTML =
      '<div class="tth-dh-bar">' +
      '<div class="tth-dh-logo" role="img" aria-label="TET TestHub">' + MARK + '<b>TETTEST<span>HUB</span></b></div>' +
      '<div class="tth-dh-nav" role="navigation" aria-label="Exam navigation">' +
      '<a class="tth-dh-btn" style="background:#10b981" href="https://tettesthub.in/index.html">' + ICON.home + '<span>Home</span></a>' +
      '<a class="tth-dh-btn" style="background:#8b5cf6" href="/course-folders.html">' + ICON.grid + '<span>All Courses</span></a>' +
      '<a class="tth-dh-btn" style="background:#0ea5e9" href="/dashboard.html">' + ICON.list + '<span>My Test</span></a>' +
      '<button class="tth-dh-btn" style="background:#f43f5e" type="button" data-dh-logout aria-label="Logout">' + ICON.out + '<span>Logout</span></button>' +
      '</div><div class="tth-dh-right">' +
      '<div class="tth-dh-lang" role="group" aria-label="Language / भाषा"><button type="button" data-dh-lang="hi">हिंदी</button><button type="button" data-dh-lang="en">English</button></div>' +
      '<div class="tth-dh-id">' + identity() + '</div>' +
      '</div></div>';
    document.body.insertBefore(el, document.body.firstChild);

    var langBtns = el.querySelectorAll("[data-dh-lang]");
    function sync() {
      var cur = lang();
      langBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-dh-lang") === cur)); });
    }
    langBtns.forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-dh-lang")); setTimeout(sync, 50); });
    });
    // Keep in sync when a toggle elsewhere on the page changes the language.
    document.addEventListener("click", function () { setTimeout(sync, 50); });
    sync();

    el.querySelectorAll(".tth-dh-nav [data-dh-logout]").forEach(function (b) { b.addEventListener("click", signOut); });
    var box = el.querySelector(".tth-dh-id");
    var shown = identity();
    function bindIdentity() {
      var idBtn = box.querySelector("[data-dh-id]");
      if (!idBtn) return;
      var menu = idBtn.nextElementSibling;
      idBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
        idBtn.setAttribute("aria-expanded", String(!menu.hidden));
      });
      menu.querySelector("[data-dh-logout]").addEventListener("click", signOut);
    }
    bindIdentity();
    document.addEventListener("click", function (e) {
      var menu = box.querySelector(".tth-dh-menu");
      if (menu && !menu.hidden && !menu.contains(e.target)) { menu.hidden = true; box.querySelector("[data-dh-id]").setAttribute("aria-expanded", "false"); }
    });
    // auth.js fills the student ID after the profile loads; refresh the chip then.
    [1500, 4000].forEach(function (ms) {
      setTimeout(function () {
        var next = identity();
        if (next !== shown) { shown = next; box.innerHTML = next; bindIdentity(); }
      }, ms);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
