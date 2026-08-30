// Shared Supabase auth helpers.
// Load order on every page that needs this: assets/vendor/supabase/supabase.js, then
// js/site-config.js, then this file.

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(
    SITE_CONFIG.supabaseUrl,
    SITE_CONFIG.supabaseAnonKey
  );
} catch (e) {
  // Happens when js/site-config.js still has placeholder Supabase values —
  // every function below degrades to "not logged in" instead of breaking the page.
  console.warn("Supabase is not configured yet — see ADMIN_INSTRUCTIONS.md.", e);
}

function studentIdToEmail(studentId) {
  return `${studentId.trim().toLowerCase()}@${SITE_CONFIG.studentEmailDomain}`;
}

// Falls back to the English text on pages that don't load js/i18n.js (e.g. the exam
// pages, which have their own separate per-question language toggle).
function _authT(key, en) {
  return typeof t === "function" ? t(key) : en;
}

// Returns { ok: true } on success, or { ok: false, message } with a
// student-friendly (non-technical) error message on failure.
async function loginWithStudentId(studentId, password) {
  if (!studentId || !password) {
    return { ok: false, message: _authT("auth_err_missing", "Please enter your Student ID and password.") };
  }
  if (!supabaseClient) {
    return { ok: false, message: _authT("auth_err_unavailable", "Login isn't available yet. Please try again later.") };
  }
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: studentIdToEmail(studentId),
      password,
    });
    if (error) {
      return { ok: false, message: _authT("auth_err_invalid", "Incorrect Student ID or password. Please check and try again.") };
    }
    return { ok: true, session: data.session };
  } catch (e) {
    return { ok: false, message: _authT("auth_err_generic", "Something went wrong. Please try again in a moment.") };
  }
}

async function logout() {
  if (!supabaseClient) return;
  try {
    await supabaseClient.auth.signOut();
  } catch (e) {
    // Nothing to clean up if there was never a working client.
  }
}

async function getSession() {
  if (!supabaseClient) return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data.session || null;
  } catch (e) {
    return null;
  }
}

// Returns the student's profile row, or null if not found / not allowed / network error.
async function getProfile(userId) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("student_id, full_name, package, purchased_tests, status")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// Call at the top of any page that requires login. Redirects to login.html
// (preserving the current page as ?next=) if there is no active session.
// Returns the session, or null (after redirecting).
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    const next = encodeURIComponent(location.pathname.split("/").pop() || "dashboard.html");
    location.replace(`login.html?next=${next}`);
    return null;
  }
  return session;
}

// Check if a student has access to a specific test.
// Returns true if: test is free (in FREE_TESTS) OR student has purchased it.
function canAccessTest(testId, profile) {
  if (!profile) return false;

  // Always allow free tests
  if (FREE_TESTS && FREE_TESTS.includes(testId)) {
    return profile.status === 'active';
  }

  // Allow purchased tests
  return profile.status === 'active' && (profile.purchased_tests || []).includes(testId);
}
