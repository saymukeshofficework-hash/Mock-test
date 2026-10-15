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

  function run() { installStyles(); addTestHeader(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
