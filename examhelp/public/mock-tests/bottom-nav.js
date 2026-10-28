(function () {
  // Hide only the redundant mobile Home link that appears immediately before
  // the TET Test Hub brand. Keep desktop header navigation and the bottom nav.
  const hideRedundantMobileHome = () => {
    const brand = Array.from(document.querySelectorAll('header .brand, header .logo, header [class*="brand"], header [class*="logo"], .topbar .brand, .topbar .logo'))
      .find((el) => /TET\s*(TEST\s*)?HUB|TET\s*TASTE/i.test(el.textContent || ""));
    if (!brand) return;
    const header = brand.closest("header, .top, .topbar, .hdr, nav") || brand.parentElement;
    if (!header) return;
    header.querySelectorAll("a, button").forEach((el) => {
      const label = (el.textContent || "").replace(/\s+/g, " ").trim();
      const isHome = /^(?:⌂\s*)?(?:home|होम)(?:\s*\/\s*home)?$/i.test(label);
      const comesBeforeBrand = !!(el.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (isHome && comesBeforeBrand) el.classList.add("tth-redundant-mobile-home");
    });
  };
  const mobileHomeStyle = document.createElement("style");
  mobileHomeStyle.textContent = "@media(max-width:899px){.tth-redundant-mobile-home{display:none!important}}";
  document.head.appendChild(mobileHomeStyle);
  hideRedundantMobileHome();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hideRedundantMobileHome, { once: true });
  if (document.getElementById("tthExamBottomNav") || document.getElementById("tthMockBottomNav")) return;
  const style = document.createElement("style");
  style.textContent = `
    body { padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px)) !important; }
    #tthExamBottomNav { position:fixed; left:0; right:0; bottom:0; z-index:100000; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px)); background:#fff; border-top:1px solid #dbe3e8; box-shadow:0 -4px 18px rgba(15,23,42,.12); }
    #tthExamBottomNav a, #tthExamBottomNav button { min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:7px 3px; border:0; border-radius:0; background:transparent !important; box-shadow:none !important; text-decoration:none; font:700 11px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif; cursor:pointer; }
    #tthExamBottomNav .home { color:#2563eb; }
    #tthExamBottomNav .mytest { color:#7c3aed; }
    #tthExamBottomNav .courses { color:#7c3aed; }
    #tthExamBottomNav .logout { color:#ea580c; }
    #tthExamBottomNav .ico { font-size:19px; line-height:1; }
    @media(min-width:900px) { body { padding-bottom: 0 !important; } #tthExamBottomNav { display:none !important; } }
  `;
  document.head.appendChild(style);
  const nav = document.createElement("nav");
  nav.id = "tthExamBottomNav";
  nav.setAttribute("aria-label", "Test navigation");
  nav.setAttribute("data-tth-no-translate", "true");
  nav.innerHTML = `
    <a class="home" href="https://tettesthub.in/index.html"><span class="ico" aria-hidden="true">⌂</span><span>Home</span></a>
    <a class="courses" href="https://tettesthub.in/course-folders.html"><span class="ico" aria-hidden="true">▤</span><span>Courses</span></a>
    <a class="mytest" href="https://tettesthub.in/dashboard.html"><span class="ico" aria-hidden="true">▦</span><span>My Test</span></a>
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