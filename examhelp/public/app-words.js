// Android app only (Google Play): no "Paid"/"Free" wording anywhere. Loaded by app-mode.js and the shared nav scripts.
// Replaces "Paid Test" with "Test Series", drops the words free/फ्री/मुफ्त/पेड from labels, hides lines that only make sense with them.
(function () {
  try {
    if (document.documentElement.getAttribute("data-app") !== "1" && localStorage.getItem("tth-app") !== "1") return;
  } catch (e) { return; }
  if (window.__tthWords) return;
  window.__tthWords = 1;

  var D = "\\u0900-\\u097F";
  var HI = "(?:फ्री|फ़्री|मुफ्त|मुफ़्त|निःशुल्क|नि:शुल्क|सशुल्क|पेड)";
  var HI_RE = new RegExp("(^|[^" + D + "])" + HI + "(?![" + D + "])", "g");
  var EN_RE = /\bfree\b(?!\s+press)/gi;
  var PAID_RE = /\bpaid\s+tests?\b/gi;
  var HI_PAID_RE = new RegExp("(^|[^" + D + "])पेड\\s+टेस्ट(?![" + D + "])", "g");
  var TEST1_RE = new RegExp("(टेस्ट|Test)\\s*1\\s*(?:is\\s*)?(?:फ्री|मुफ्त|मुफ़्त|free)|locked|लॉक", "i");
  var DANGLING_RE = new RegExp("(?:के लिए|में|का|की|है|हैं|for|is|are|all|and|के साथ)\\s*[.:|·—-]*\\s*$", "i");
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1 };

  function tidy(s) {
    return s.replace(/\s*[·|•—–-]\s*(?=[·|•—–-]|$)/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").replace(/\s+([,.:;।])/g, "$1").replace(/^[\s·|•—–,:;-]+|[\s·|•—–,:;-]+$/g, "");
  }
  function hide(el) {
    // hide the smallest element that holds only this text (badge/line), not a large container
    var e = el;
    while (e.parentElement && e.parentElement !== document.body && e.parentElement.textContent.trim() === e.textContent.trim()) e = e.parentElement;
    e.style.setProperty("display", "none", "important");
  }
  function fixNode(n) {
    var el = n.parentElement;
    if (!el || SKIP[el.tagName] || el.closest("[data-app-words-done]")) return;
    var t = n.nodeValue;
    if (!t || t.trim().length < 2) return;
    var s = t.replace(PAID_RE, "Test Series").replace(HI_PAID_RE, "$1टेस्ट सीरीज़");
    var has = s !== t || HI_RE.test(s) || EN_RE.test(s);
    HI_RE.lastIndex = 0; EN_RE.lastIndex = 0;
    if (!has) return;
    var asked = new RegExp("(^|[^" + D + "])(?:पेड|सशुल्क)\\s+(?:हैं|है)|\\bpaid\\b(?!\\s+tests?)", "i").test(t);
    if (asked || TEST1_RE.test(s)) { var det = el.closest("details"); n.nodeValue = ""; hide(det || el); return; }
    var out = tidy(s.replace(HI_RE, "$1").replace(EN_RE, ""));
    HI_RE.lastIndex = 0; EN_RE.lastIndex = 0;
    if (out.length < 4 || DANGLING_RE.test(out)) { n.nodeValue = ""; hide(el); return; }
    n.nodeValue = out;
  }
  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixNode(root); return; }
    if (root.nodeType !== 1 || SKIP[root.tagName]) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(fixNode);
    if (root.querySelectorAll) root.querySelectorAll("[placeholder],[aria-label],[title],[alt]").forEach(function (e) {
      ["placeholder", "aria-label", "title", "alt"].forEach(function (a) {
        var v = e.getAttribute(a); if (v && (PAID_RE.test(v) || EN_RE.test(v) || HI_RE.test(v))) e.setAttribute(a, v.replace(PAID_RE, "Test Series").replace(HI_RE, "$1").replace(EN_RE, "").trim());
        PAID_RE.lastIndex = 0; EN_RE.lastIndex = 0; HI_RE.lastIndex = 0;
      });
    });
  }
  function start() {
    scan(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === "characterData") fixNode(m.target);
        m.addedNodes && m.addedNodes.forEach(function (a) { scan(a); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    if (document.title) document.title = document.title.replace(PAID_RE, "Test Series").replace(EN_RE, "").replace(/\s{2,}/g, " ");
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
