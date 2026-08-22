/* Shell behaviour shared by every page: theme, header stats, small UI widgets.
   Must load AFTER config/storage/progress/gamification. */
(function () {
  const root = document.documentElement;

  function initTheme() {
    const saved = Storage.get("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", theme);
    updateThemeToggleUI(theme);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    Storage.set("theme", next);
    updateThemeToggleUI(next);
  }

  function updateThemeToggleUI(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function refreshHeaderStats() {
    if (typeof Progress === "undefined") return;
    const state = Progress.get();
    document.querySelectorAll("[data-stat='streak']").forEach((el) => (el.textContent = state.streak));
    document.querySelectorAll("[data-stat='xp']").forEach((el) => (el.textContent = state.xp));
    if (typeof Gamification !== "undefined") {
      const level = Gamification.getLevel(state.xp);
      document.querySelectorAll("[data-stat='level']").forEach((el) => (el.textContent = level.name));
    }
  }

  function showToast(message, duration = 2200) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
  }
  window.showToast = showToast;

  function initAccordions() {
    document.querySelectorAll(".accordion-item .accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        trigger.closest(".accordion-item").classList.toggle("open");
      });
    });
  }

  function initPillTabs() {
    document.querySelectorAll("[data-tabs]").forEach((group) => {
      const buttons = group.querySelectorAll("button[data-tab]");
      const panels = document.querySelectorAll(`[data-tab-panel][data-tabs-for="${group.dataset.tabs}"]`);
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          panels.forEach((p) => {
            p.style.display = p.dataset.tabPanel === btn.dataset.tab ? "" : "none";
          });
        });
      });
    });
  }

  function initMobileMenu() {
    const btn = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    refreshHeaderStats();
    initAccordions();
    initPillTabs();
    initMobileMenu();
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => btn.addEventListener("click", toggleTheme));
    if (typeof Progress !== "undefined") Progress.touchStreak();
  });

  window.BBCApp = { refreshHeaderStats, toggleTheme };

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
})();
