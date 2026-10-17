// Ensure the public site entry URL opens student login before the homepage.
(function () {
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var isSiteHome = path === '/' || path === '/index.html';
  var hasLoginSuccessFlag = new URLSearchParams(window.location.search).get('loggedin') === '1';
  if (isSiteHome && !hasLoginSuccessFlag) {
    window.location.replace('/login.html?next=index.html%3Floggedin%3D1');
  }
})();
