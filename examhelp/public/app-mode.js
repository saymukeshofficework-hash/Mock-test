// Marks the page as "inside the Android app" so selling UI is hidden (Google Play billing policy).
(function () {
  try {
    var k = "tth-app";
    if (/[?&]source=android/.test(location.search) || /^android-app:/.test(document.referrer)) localStorage.setItem(k, "1");
    if (localStorage.getItem(k) === "1") document.documentElement.setAttribute("data-app", "1");
  } catch (e) {}
  // Pure sales pages: send app users to the catalogue home instead.
  var sales = ["/examhelp/mp-high-court-assistant-grade-3-notes", "/examhelp/mp-high-court-assistant-grade-3-test-series"];
  if (document.documentElement.getAttribute("data-app") && sales.some(function (p) { return location.pathname.indexOf(p) === 0; })) location.replace("/examhelp/");
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/examhelp/sw.js", { scope: "/examhelp/" }).catch(function () {});
    });
  }
})();
