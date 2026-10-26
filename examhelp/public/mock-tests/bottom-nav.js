(function () {
  if (document.getElementById("tthExamBottomNav") || document.getElementById("tthMockBottomNav")) return;
  const style = document.createElement("style");
  style.textContent = `
    body { padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px)) !important; }
    #tthExamBottomNav { position:fixed; left:0; right:0; bottom:0; z-index:100000; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px)); background:#fff; border-top:1px solid #dbe3e8; box-shadow:0 -4px 18px rgba(15,23,42,.12); }
    #tthExamBottomNav a, #tthExamBottomNav button { min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:7px 3px; border:0; border-radius:0; background:transparent !important; box-shadow:none !important; text-decoration:none; font:700 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif; cursor:pointer; }
    #tthExamBottomNav .home { color:#2563eb; }
    #tthExamBottomNav .mytest { color:#7c3aed; }
    #tthExamBottomNav .contact { color:#0f9d70; }
    #tthExamBottomNav .logout { color:#ea580c; }
    #tthExamBottomNav .ico { font-size:19px; line-height:1; }
    @media(min-width:900px) { #tthExamBottomNav { left:50%; right:auto; width:min(520px,100%); transform:translateX(-50%); border:1px solid #dbe3e8; border-bottom:0; border-radius:14px 14px 0 0; } }
  `;
  document.head.appendChild(style);
  const nav = document.createElement("nav");
  nav.id = "tthExamBottomNav";
  nav.setAttribute("aria-label", "Test navigation");
  nav.setAttribute("data-tth-no-translate", "true");
  nav.innerHTML = `
    <a class="home" href="https://tettesthub.in/index.html"><span class="ico" aria-hidden="true">⌂</span><span>Home</span></a>
    <a class="mytest" href="https://tettesthub.in/dashboard.html"><span class="ico" aria-hidden="true">▦</span><span>My Test</span></a>
    <a class="contact" href="https://tettesthub.in/contact.html"><span class="ico" aria-hidden="true">✉</span><span>Contact</span></a>
    <button class="logout" type="button"><span class="ico" aria-hidden="true">↪</span><span>Logout</span></button>`;
  document.body.appendChild(nav);
  nav.querySelector("button").addEventListener("click", async function () {
    this.disabled = true;
    try {
      if (typeof window.logout === "function") await window.logout();
      else if (window.supabaseClient && window.supabaseClient.auth) await window.supabaseClient.auth.signOut();
      else {
        Object.keys(localStorage).filter((key) => key.includes("auth-token") || key.startsWith("sb-")).forEach((key) => localStorage.removeItem(key));
      }
      sessionStorage.clear();
    } catch (e) { console.error("Logout failed", e); }
    window.location.href = "https://tettesthub.in/login.html";
  });
})();