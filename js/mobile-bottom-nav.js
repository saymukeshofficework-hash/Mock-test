(function () {
  const path = window.location.pathname;
  const testId = new URLSearchParams(window.location.search).get("t") || "";
  const isTargetPage =
    /^\/cpct\/?$/.test(path) ||
    /^\/tet\/?$/.test(path) ||
    /^\/cpct\/typing\.html$/.test(path) ||
    /^\/tet-mock-test-\d+\.html$/.test(path) ||
    (path === "/exam-test.html" && /^(cpct|tet)/i.test(testId));
  if (!isTargetPage || document.getElementById("tthColorBottomNav")) return;

  const style = document.createElement("style");
  style.textContent = `
    body { padding-bottom: calc(82px + env(safe-area-inset-bottom, 0px)) !important; }
    #tthColorBottomNav { position:fixed; left:0; right:0; bottom:0; z-index:100000; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; padding:7px 8px calc(7px + env(safe-area-inset-bottom,0px)); background:rgba(255,255,255,.98); border-top:1px solid #dbe3e8; box-shadow:0 -5px 20px rgba(15,23,42,.14); }
    #tthColorBottomNav a, #tthColorBottomNav button { min-width:0; min-height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:5px 2px; border:1px solid transparent; border-radius:12px; text-decoration:none; font:700 10.5px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif; cursor:pointer; }
    #tthColorBottomNav .ico { font-size:18px; line-height:1; }
    #tthColorBottomNav .home { color:#1d4ed8; background:#dbeafe !important; border-color:#bfdbfe; }
    #tthColorBottomNav .courses { color:#047857; background:#d1fae5 !important; border-color:#a7f3d0; }
    #tthColorBottomNav .mytest { color:#6d28d9; background:#ede9fe !important; border-color:#ddd6fe; }
    #tthColorBottomNav .logout { color:#c2410c; background:#ffedd5 !important; border-color:#fed7aa; }
    @media(min-width:900px) { body { padding-bottom:0 !important; } #tthColorBottomNav { display:none !important; } }
  `;
  document.head.appendChild(style);

  const nav = document.createElement("nav");
  nav.id = "tthColorBottomNav";
  nav.setAttribute("aria-label", "Test navigation");
  nav.setAttribute("data-tth-no-translate", "true");
  nav.innerHTML = `
    <a class="home" href="/index.html"><span class="ico" aria-hidden="true">⌂</span><span>Home</span></a>
    <a class="courses" href="/course-folders.html"><span class="ico" aria-hidden="true">▤</span><span>Courses</span></a>
    <a class="mytest" href="/dashboard.html"><span class="ico" aria-hidden="true">▦</span><span>My Test</span></a>
    <button class="logout" type="button"><span class="ico" aria-hidden="true">↪</span><span>Logout</span></button>`;
  document.body.appendChild(nav);

  nav.querySelector("button").addEventListener("click", async function () {
    this.disabled = true;
    try {
      if (typeof window.logout === "function") await window.logout();
      else if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
      else {
        Object.keys(localStorage)
          .filter((key) => key.includes("auth-token") || key.startsWith("sb-"))
          .forEach((key) => localStorage.removeItem(key));
      }
      sessionStorage.clear();
    } catch (error) {
      console.error("Logout failed", error);
    }
    window.location.href = "/login.html";
  });
})();