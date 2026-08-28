// Central configuration for TET Test Hub.
// Edit values here — nothing else needs to change when you update prices
// or contact details. See ADMIN_INSTRUCTIONS.md.

const SITE_CONFIG = {
  name: "TET Test Hub",
  tagline: "Prepare. Practice. Perform.",

  contact: {
    email: "saymukeshofficework@gmail.com",
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

// Pricing: Test 01 & 02 are FREE. Tests 03-20 sold as one ₹199 bundle.
// No individual test purchases — only free access or the full ₹199 bundle.
const PRICES = {
  all18: 199,  // Tests 03-20 (18 tests total)
};

// Tests that are FREE for all logged-in students
const FREE_TESTS = ["test01", "test02"];

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
];
