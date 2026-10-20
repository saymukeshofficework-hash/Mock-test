// Ensure the public site entry URL opens student login before the homepage.
(function () {
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var isSiteHome = path === '/' || path === '/index.html';
  var hasLoginSuccessFlag = new URLSearchParams(window.location.search).get('loggedin') === '1';
  // A signed-in student (saved Supabase session) stays on the homepage. login.html clears
  // the session on open, so redirecting them there from Home would log them out.
  var hasSession = false;
  try {
    var saved = JSON.parse(localStorage.getItem('sb-ovaubhekxjtkodkhsybg-auth-token') || 'null');
    hasSession = !!(saved && (saved.refresh_token || (saved.currentSession && saved.currentSession.refresh_token)));
  } catch (e) {}
  if (isSiteHome && !hasLoginSuccessFlag && !hasSession) {
    window.location.replace('/login.html?next=index.html%3Floggedin%3D1');
  }
})();
