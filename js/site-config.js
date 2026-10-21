// Central configuration for TET Test Hub.
// Edit values here — nothing else needs to change when you update prices
// or contact details. See ADMIN_INSTRUCTIONS.md.

const SITE_CONFIG = {
  name: "TET Test Hub",
  tagline: "Prepare. Practice. Perform.",

  contact: {
    email: "saymukeshofficework@gmail.com",
    // Each number is shown as both a WhatsApp chat link and a Call link.
    // "wa" is the number with country code, no + or spaces (required by wa.me).
    phones: [
      { display: "9179056016", wa: "919179056016" },
      { display: "7999811326", wa: "917999811326" },
    ],
  },

  // From your Supabase project: Project Settings -> API.
  // The anon key is a PUBLIC key by design — safe to publish. It cannot read or write
  // anything beyond what supabase/schema.sql's Row Level Security policies allow, which
  // is the actual protection (not keeping this key secret). Never paste the "service_role"
  // key here or anywhere in this repository.
  supabaseUrl: "https://ovaubhekxjtkodkhsybg.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s",

  // Students log in with a Student ID, but Supabase Auth needs an email address, so the
  // frontend maps "TET26001" -> "tet26001@students.tettesthub.app". Nothing is ever sent
  // to these addresses. See ADMIN_INSTRUCTIONS.md for how you create accounts.
  studentEmailDomain: "students.tettesthub.app",
};

// Pricing: Test 01 & 02 are FREE. Tests 03-20 sold as one ₹99 bundle.
// No individual test purchases — only free access or the full ₹149 bundle.
const PRICES = {
  all18: 99,  // Tests 03-20 (18 tests total)
};

// Razorpay Payment Link for the ₹99 bundle. Create this in your Razorpay
// Dashboard -> Payment Links -> Create Payment Link (see ADMIN_INSTRUCTIONS.md
// for the exact steps), then paste the resulting https://rzp.io/... URL here.
// Payment is still verified and Supabase accounts still created manually —
// this only replaces "email us to arrange payment" with a proper checkout page.
const PAYMENT_LINKS = {
  all18: "https://rzp.io/rzp/t7ENfTq",
};

// Tests that are FREE for all logged-in students
const FREE_TESTS = ["test01"];
// 14-day free offer (owner, 2026-10-21): until this time every test is open to any logged-in
// student and prices are hidden. It ends by itself. Keep the same date in the RLS policy
// (supabase/migrations/20261021090000_free_access_window.sql), examhelp/src/lib/site.ts,
// examhelp/public/mock-tests/free-pass.js and examhelp notes-checkout.
const FREE_ACCESS_UNTIL = "2026-11-04T23:59:59+05:30";
const freeAccessOn = () => Date.now() < Date.parse(FREE_ACCESS_UNTIL);
const FREE_OFFER_HTML = '<h2>🎉 14 दिन सभी टेस्ट फ्री / All tests free for 14 days</h2><p>4 नवंबर 2026 तक सिर्फ लॉगिन करें और सभी टेस्ट दें।<br>Till 4 Nov 2026, just log in to take every test.</p>';

// One row per test. `id` must match the purchased_tests values you set in Supabase;
// `file` must match an actual tet-mock-test-N.html page.
const TEST_CATALOG = [
  { id: "test01", number: 1, file: "tet-mock-test-1.html", title: "TET Full Test 01", questions: 150, minutes: 150 },
  { id: "test02", number: 2, file: "tet-mock-test-2.html", title: "TET Full Test 02", questions: 150, minutes: 150 },
  { id: "test03", number: 3, file: "tet-mock-test-3.html", title: "TET Full Test 03", questions: 150, minutes: 150 },
  { id: "test04", number: 4, file: "tet-mock-test-4.html", title: "TET Full Test 04", questions: 150, minutes: 150 },
  { id: "test05", number: 5, file: "tet-mock-test-5.html", title: "TET Full Test 05", questions: 150, minutes: 150 },
  { id: "test06", number: 6, file: "tet-mock-test-6.html", title: "TET Full Test 06", questions: 150, minutes: 150 },
  { id: "test07", number: 7, file: "tet-mock-test-7.html", title: "TET Full Test 07", questions: 150, minutes: 150 },
  { id: "test08", number: 8, file: "tet-mock-test-8.html", title: "TET Full Test 08", questions: 150, minutes: 150 },
  { id: "test09", number: 9, file: "tet-mock-test-9.html", title: "TET Full Test 09", questions: 150, minutes: 150 },
  { id: "test10", number: 10, file: "tet-mock-test-10.html", title: "TET Full Test 10", questions: 150, minutes: 150 },
  { id: "test11", number: 11, file: "tet-mock-test-11.html", title: "TET Full Test 11", questions: 150, minutes: 150 },
  { id: "test12", number: 12, file: "tet-mock-test-12.html", title: "TET Full Test 12", questions: 150, minutes: 150 },
  { id: "test13", number: 13, file: "tet-mock-test-13.html", title: "TET Full Test 13", questions: 150, minutes: 150 },
  { id: "test14", number: 14, file: "tet-mock-test-14.html", title: "TET Full Test 14", questions: 150, minutes: 150 },
  { id: "test15", number: 15, file: "tet-mock-test-15.html", title: "TET Full Test 15", questions: 150, minutes: 150 },
  { id: "test16", number: 16, file: "tet-mock-test-16.html", title: "TET Full Test 16", questions: 150, minutes: 150 },
  { id: "test17", number: 17, file: "tet-mock-test-17.html", title: "TET Full Test 17", questions: 150, minutes: 150 },
  { id: "test18", number: 18, file: "tet-mock-test-18.html", title: "TET Full Test 18", questions: 150, minutes: 150 },
  { id: "test19", number: 19, file: "tet-mock-test-19.html", title: "TET Full Test 19", questions: 150, minutes: 150 },
  { id: "test20", number: 20, file: "tet-mock-test-20.html", title: "TET Full Test 20", questions: 150, minutes: 150 },
  { id: "test21", number: 21, file: "tet-mock-test-21.html", title: "TET Full Test 21", questions: 150, minutes: 150 },
  { id: "test22", number: 22, file: "tet-mock-test-22.html", title: "TET Full Test 22", questions: 150, minutes: 150 },
  { id: "test23", number: 23, file: "tet-mock-test-23.html", title: "TET Full Test 23", questions: 150, minutes: 150 },
  { id: "test24", number: 24, file: "tet-mock-test-24.html", title: "TET Full Test 24", questions: 150, minutes: 150 },
  { id: "test25", number: 25, file: "tet-mock-test-25.html", title: "TET Full Test 25", questions: 150, minutes: 150 },
];

// TET Primary / Secondary subject-wise series (tet/index.html).
// Each subject = one series of 25 tests; test 1 free. Ids look like "tetp-maths-01".
// Set `ready: true` on a subject once its questions are in Supabase.
const TET_LEVELS = {
  primary: {
    hi: "प्राथमिक स्तर", en: "Primary Level",
    subjects: [
      // Hindi = the original 20 full TET papers (test01..test20, pages tet-mock-test-N.html).
      { key: "hindi", hi: "हिंदी", en: "Hindi", ready: true, legacy: 20 },
      { key: "english", hi: "अंग्रेज़ी", en: "English", ready: true },
      { key: "sanskrit", hi: "संस्कृत", en: "Sanskrit", ready: true },
    ],
  },
  secondary: {
    hi: "माध्यमिक (MP STET)", en: "Secondary (MP STET)",
    subjects: [
      { key: "hindi", hi: "हिंदी", en: "Hindi", ready: true },
      { key: "english", hi: "अंग्रेज़ी", en: "English", ready: true },
      { key: "sanskrit", hi: "संस्कृत", en: "Sanskrit" },
      { key: "maths", hi: "गणित", en: "Mathematics", ready: true },
      { key: "science", hi: "विज्ञान", en: "Science", ready: true },
      { key: "sst", hi: "सामाजिक विज्ञान", en: "Social Science", ready: true },
    ],
  },
};
const TET_TESTS_PER_SUBJECT = 25;
// ₹99 per subject series (tests 2-25). tet/index.html sells it through the TETTESTHUB
// Razorpay checkout (exam-hub notes-checkout, products "tet-<series>"; keep the amount there
// in sync) and the tet-unlock Edge Function adds the tests to the buyer's profile.
const TET_SUBJECT_PRICE = 99;
// Test 1 of every ready TET subject series is free (same rule as test01).
Object.values(TET_LEVELS).forEach(lv => lv.subjects.forEach(s => {
  if (s.ready && !s.legacy) FREE_TESTS.push(`tet${lv === TET_LEVELS.primary ? "p" : "s"}-${s.key}-01`);
}));

// MP CPCT series (cpct/index.html): 25 exam tests (75 MCQ, 75 min, ids "cpct-exam-NN") and
// 25 typing tests (English + Hindi passage, ids "cpct-typing-NN"). Exam test 1 and typing
// test 1 are free (owner asked for one free typing test too, 2026-10-13).
// ₹99 for the whole series, sold like TET (exam-hub notes-checkout product "tet-cpct");
// tet-unlock adds exam tests 02-25 and typing tests 01-25 (01 is free anyway) to the buyer's profile.
// Set `ready: true` once the questions are uploaded to Supabase test_content.
const CPCT_SERIES = { tests: 25, price: 99, exam: { ready: true }, typing: { ready: true } };
FREE_TESTS.push("cpct-exam-01", "cpct-typing-01");
// RRB NTPC (/rrb-ntpc/): test 01 of each series is free; tests open in exam-test.html.
for (const l of ["g", "u"]) for (const s of ["full", "ga", "maths", "reason"]) FREE_TESTS.push(`rrbntpc-${l}-${s}-01`);

/* Small persistent Home shortcut on exam and practice pages. */
(function () {
  if (document.getElementById("tth-floating-home")) return;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/index.html") return;
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
})();
