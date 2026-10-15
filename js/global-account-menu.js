/* TET mock papers keep their existing text Home link; other exam/typing papers use a text option, not a floating icon. */
(function () {
  const path = window.location.pathname.replace(/\\/+$/, "") || "/";
  const isHome = path === "/" || path === "/index.html";
  const isTetMock = /^\\/tet-mock-test-\\d+\\.html$/.test(path);
  if (isHome) {
    // index.html owns the signed-in account menu and fills in the student's ID.
    return;
  }

  function applyHomeNavigation() {
    const floatingLinks = Array.from(document.querySelectorAll("#tth-floating-home"));
    const floatingStyles = Array.from(document.querySelectorAll("#tth-floating-home-style"));
    floatingLinks.forEach(link => link.remove());
    floatingStyles.forEach(style => style.remove());

    if (isTetMock) return;

    const hasHeaderHome = !!document.querySelector(".topbar .home-link, header .home-link");
    const isExamOrTypingPage =
      path === "/exam-test.html" ||
      path === "/bbc-english/test.html" ||
      path.startsWith("/cpct/") ||
      path.startsWith("/typing-practice/") ||
      path.startsWith("/examhelp/public/mock-tests/");

    if (hasHeaderHome || !isExamOrTypingPage) return;
    if (document.getElementById("tth-top-home")) return;

    const style = document.createElement("style");
    style.id = "tth-top-home-style";
    style.textContent = "#tth-top-home{display:inline-flex;align-items:center;justify-content:center;margin:8px 12px;padding:7px 13px;border-radius:8px;background:#0f766e;color:#fff;border:1px solid rgba(255,255,255,.9);box-shadow:0 2px 6px rgba(0,0,0,.16);font:600 14px/1.3 system-ui,sans-serif;text-decoration:none;position:relative;z-index:10}#tth-top-home:focus-visible{outline:3px solid #e8a33d;outline-offset:3px}";
    document.head.appendChild(style);

    const link = document.createElement("a");
    link.id = "tth-top-home";
    link.href = "/";
    link.textContent = "होम / Home";
    link.setAttribute("aria-label", "होम पेज पर जाएँ");
    if (document.body) document.body.insertBefore(link, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyHomeNavigation, { once: true });
  } else {
    applyHomeNavigation();
  }
})();