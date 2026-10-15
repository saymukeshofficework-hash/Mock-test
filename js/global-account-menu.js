/* Compact shared header for exam and typing pages. Home always opens the actual homepage. */
(function () {
  let path = window.location.pathname;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path === "/" || path === "/index.html") return;

  function addTestHeader() {
    const header = document.querySelector("header.topbar");
    if (!header || header.dataset.tthHeaderReady === "true") return;
    header.dataset.tthHeaderReady = "true";

    const left = header.querySelector(".topbar-left") || header;
    let home = header.querySelector(".home-link");
    if (!home) {
      home = document.createElement("a");
      home.className = "home-link";
      home.href = "/index.html";
      home.textContent = "🏠 होम";
      left.insertBefore(home, left.firstChild);
    }
    home.href = "/index.html";
    home.setAttribute("aria-label", "होम पेज पर जाएँ");
    home.textContent = "🏠 होम";

    let brand = header.querySelector(".tth-header-brand");
    if (!brand) {
      brand = document.createElement("span");
      brand.className = "tth-header-brand";
      brand.textContent = "TET Test Hub";
      left.insertBefore(brand, home);
    }

    let identity = header.querySelector(".tth-student-identity");
    if (!identity) {
      identity = document.createElement("div");
      identity.className = "tth-student-identity";
      identity.textContent = "छात्र ID";
      const idSource = document.querySelector("[data-student-id], #studentId, #studentID, .student-id, .student-id-value");
      if (idSource) {
        const value = idSource.getAttribute("data-student-id") || idSource.textContent.trim();
        if (value) identity.textContent = "छात्र ID: " + value.replace(/^छात्र\s*ID\s*:?\s*/i, "");
      }
      left.appendChild(identity);
    }
  }

  function installStyles() {
    if (document.getElementById("tth-mobile-header-style")) return;
    const style = document.createElement("style");
    style.id = "tth-mobile-header-style";
    style.textContent = `
      header.topbar .topbar-left { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; flex:1 1 100%; }
      header.topbar .tth-header-brand { color:#fff; font-size:16px; font-weight:700; white-space:nowrap; }
      header.topbar .home-link { margin:0; padding:6px 10px; font-size:13px; }
      header.topbar .tth-student-identity { flex-basis:100%; width:100%; min-width:0; font-size:12px; line-height:1.25; overflow-wrap:anywhere; color:#e7f4f1; margin-top:-3px; }
      header.topbar h1 { min-width:0; }
      @media(max-width:600px) {
        header.topbar { padding:7px 10px; gap:5px; }
        header.topbar .topbar-left { gap:7px; }
        header.topbar .tth-header-brand { font-size:15px; }
        header.topbar .home-link { padding:5px 8px; font-size:12px; }
        header.topbar .timer { font-size:12px; padding:3px 7px; }
      }`;
    document.head.appendChild(style);
  }

  function run() { installStyles(); addTestHeader(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
})();
