// Browser-only client for the /admin/ pages. Uses the public anon key — safe to
// ship in the bundle; supabase/blog_admin_schema.sql's Row Level Security (an
// admin-email check, not "any logged-in user") is what actually protects writes.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;

export interface BlogSubmission {
  id: string;
  slug: string;
  raw_markdown: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}
