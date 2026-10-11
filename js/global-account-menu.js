/* Account menu is intentionally limited to the post-login home page.
   Exam/test screens must not inject their own Dashboard or Logout controls. */
(function () {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const isHome = path === '/' || path === '/index.html';
  if (!isHome) return;
  // index.html owns the signed-in account menu and fills in the student's ID.
  if (document.getElementById('accountMenu')) return;
})();