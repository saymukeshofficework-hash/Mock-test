/* Keep account controls on the post-login home page; add a small Home shortcut everywhere else. */
(function () {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isHome = path === "/" || path === "/index.html";
  if (!isHome && !document.getElementById("tth-floating-home")) {
    const style = document.createElement("style");
    style.textContent = "#tth-floating-home{position:fixed;right:14px;bottom:86px;z-index:9999;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#0f766e;color:#fff;border:2px solid rgba(255,255,255,.9);box-shadow:0 3px 12px rgba(0,0,0,.25);text-decoration:none}#tth-floating-home svg{width:21px;height:21px;display:block}#tth-floating-home:focus-visible{outline:3px solid #e8a33d;outline-offset:3px}@media(max-width:640px){#tth-floating-home{right:12px;bottom:78px;width:40px;height:40px}}";
    document.head.appendChild(style);
    const link = document.createElement("a");
    link.id = "tth-floating-home";
    link.href = "/";
    link.setAttribute("aria-label", "होम पेज पर जाएँ");
    link.title = "होम";
    link.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></svg>';
    if (document.body) document.body.appendChild(link); else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(link), { once: true });
  }
  if (!isHome) return;
  // index.html owns the signed-in account menu and fills in the student's ID.
  if (document.getElementById('accountMenu')) return;
})();