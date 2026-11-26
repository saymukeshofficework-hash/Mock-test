// Public configuration. The URLs and anon key are the same public values the website ships
// in js/site-config.js; Row Level Security on Supabase protects the data, not these keys.
export const MAIN_SUPABASE_URL =
  process.env.EXPO_PUBLIC_MAIN_SUPABASE_URL ?? "https://ovaubhekxjtkodkhsybg.supabase.co";
export const MAIN_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_MAIN_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s";
// exam-hub project: orders, test-series papers and daily current affairs (Edge Function notes-checkout).
export const HUB_FUNCTIONS_URL =
  process.env.EXPO_PUBLIC_HUB_FUNCTIONS_URL ?? "https://znulepzdihzhjmuvyroi.supabase.co/functions/v1";
export const SITE_URL = "https://tettesthub.in";
export const EXAMHELP_URL = `${SITE_URL}/examhelp`;
export const STUDENT_EMAIL_DOMAIN = "students.tettesthub.app";
export const LINKS = {
  privacy: `${EXAMHELP_URL}/privacy-policy/`,
  terms: `${EXAMHELP_URL}/terms/`,
  deleteAccount: `${EXAMHELP_URL}/delete-account/`,
  contact: `${EXAMHELP_URL}/contact/`,
  help: `${EXAMHELP_URL}/faq/`,
  whatsapp: "https://wa.me/918770375866",
  resetRedirect: `${SITE_URL}/reset-password.html`,
};
// Daily current affairs reminder (owner rule): 5:00 AM Asia/Kolkata.
export const CA_REMINDER = { hour: 5, minute: 0 };
