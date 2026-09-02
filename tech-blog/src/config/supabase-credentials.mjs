// Single source of truth for the tech-blog admin panel's Supabase project.
// Plain .mjs (not .ts) so both the browser bundle (src/lib/supabase-admin.ts,
// via Vite/esbuild) and the plain-Node build script
// (scripts/sync-admin-posts.mjs) can import the exact same values.
//
// This is the public "anon" key — safe to commit and ship in the browser
// bundle (same pattern as js/site-config.js's Supabase key at the repo root).
// supabase/blog_admin_schema.sql's Row Level Security (a two-admin-account
// allowlist) is what actually protects writes, not secrecy of this key.
export const SUPABASE_URL = 'https://ovaubhekxjtkodkhsybg.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92YXViaGVreGp0a29ka2hzeWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTk4NDMsImV4cCI6MjEwMzQzNTg0M30.KKDmp6mt2YEIKxI0BP5I7BvAgMAStNXJiwgUy3X4b2s';
