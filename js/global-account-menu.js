(() => {
  const key = "sb-ovaubhekxjtkodkhsybg-auth-token";
  let session = null;
  try { session = JSON.parse(localStorage.getItem(key) || "null"); } catch (_) {}
  if (!session || !session.access_token || document.getElementById("accountMenu")) return;
  const menu = document.createElement("div");
  menu.className = "global-account-menu";
  menu.innerHTML = '<button type="button" aria-expanded="false" class="global-account-toggle">मेरा अकाउंट ▾</button><div class="global-account-dropdown" hidden><a href="/dashboard.html">डैशबोर्ड</a><button type="button">लॉगआउट</button></div>';
  const toggle = menu.querySelector(".global-account-toggle");
  const dropdown = menu.querySelector(".global-account-dropdown");
  toggle.onclick = () => { dropdown.hidden = !dropdown.hidden; toggle.setAttribute("aria-expanded", String(!dropdown.hidden)); };
  document.addEventListener("click", e => { if (!menu.contains(e.target)) { dropdown.hidden = true; toggle.setAttribute("aria-expanded", "false"); } });
  menu.querySelector(".global-account-dropdown button").onclick = async () => {
    try {
      if (typeof window.logout === "function") await window.logout();
      else {
        const cfg = window.SITE_CONFIG || {};
        const authUrl = cfg.supabaseUrl || "https://ovaubhekxjtkodkhsybg.supabase.co";
        const anonKey = cfg.supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s";
        await fetch(authUrl + "/auth/v1/logout", {
          method: "POST",
          headers: { apikey: anonKey, Authorization: "Bearer " + session.access_token }
        });
      }
    } catch (_) {}
    localStorage.removeItem(key);
    localStorage.removeItem("tth_user");
    location.href = "/index.html";
  };
  const style = document.createElement("style");
  style.textContent = ".global-account-menu{position:relative;display:inline-flex;align-items:center;z-index:9999}.global-account-toggle{border:1px solid #d8c9f3;border-radius:10px;background:#f1ebf9;color:#5b36a8;padding:8px 10px;font:600 12px system-ui;cursor:pointer}.global-account-dropdown{position:absolute;right:0;top:calc(100% + 6px);min-width:130px;padding:6px;background:#fff;border:1px solid #e5dcef;border-radius:12px;box-shadow:0 8px 24px #24153a24}.global-account-dropdown a,.global-account-dropdown button{display:block;width:100%;padding:10px;border:0;background:transparent;color:#342052;text-align:left;text-decoration:none;font:13px system-ui;cursor:pointer}.global-account-dropdown[hidden]{display:none}header.topbar .global-account-menu{margin-left:auto}";
  document.head.appendChild(style);
  const nav = document.querySelector(".site-header nav");
  const bar = document.querySelector(".hdr .bar");
  const topbar = document.querySelector("header.topbar");
  if (nav) nav.appendChild(menu);
  else if (bar) { const chip = document.getElementById("userChip"); if (chip) chip.hidden = true; bar.appendChild(menu); }
  else if (topbar) { const timer = topbar.querySelector(".timer"); if (timer) topbar.insertBefore(menu, timer); else topbar.appendChild(menu); }
  else { menu.style.cssText = "position:fixed;top:12px;right:12px"; document.body.appendChild(menu); }
})();