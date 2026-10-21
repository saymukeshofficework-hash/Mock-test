// 14-day free offer (owner, 2026-10-21): until FREE_UNTIL a logged-in student opens every paid
// test with their main-site login. Same date in js/site-config.js and notes-checkout.
(function () {
  var FREE_UNTIL = Date.parse("2026-11-04T23:59:59+05:30");
  var KEY = "sb-ovaubhekxjtkodkhsybg-auth-token";
  var MAIN_URL = "https://ovaubhekxjtkodkhsybg.supabase.co";
  var MAIN_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWxlcHpkaWh6aGptdXZ5cm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjE5MjIsImV4cCI6MjEwNjY5NzkyMn0.XoqC6vNDJkEAxgtXLVPCpTxocv3lAa-ZBeg69OdbhdU";
  function on() { return Date.now() < FREE_UNTIL; }
  // main-site access token, refreshed when it is about to expire; null when logged out
  function token() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!s || !s.access_token) return Promise.resolve(null);
    if (!s.expires_at || s.expires_at * 1000 > Date.now() + 60000) return Promise.resolve(s.access_token);
    if (!s.refresh_token) return Promise.resolve(null);
    return fetch(MAIN_URL + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { "Content-Type": "application/json", apikey: MAIN_ANON }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (f) {
        if (!f || !f.access_token) return null;
        f.expires_at = f.expires_at || Math.floor(Date.now() / 1000) + (f.expires_in || 3600);
        try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, s, f))); } catch (e) {}
        return f.access_token;
      })
      .catch(function () { return null; });
  }
  window.tthFree = { on: on, token: token };
})();
