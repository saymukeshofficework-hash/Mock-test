// Browser-only client for the /admin/ pages. No env vars / GitHub secrets
// needed — see src/config/supabase-credentials.mjs for why it's safe to
// commit the anon key directly.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase-credentials.mjs';

// Admin sign-in uses a plain "Admin ID" (admin1 / admin2), not an email —
// Supabase Auth only accepts emails, so this maps each ID to a synthetic
// address under this domain, exactly like js/site-config.js's
// studentEmailDomain does for TET Test Hub student IDs. These addresses are
// never emailed — the two accounts were created directly with a password.
export const ADMIN_EMAIL_DOMAIN = 'blog-admin.tettesthub.app';

export function adminIdToEmail(adminId: string): string {
  return `${adminId.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
}

export const supabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface BlogSubmission {
  id: string;
  slug: string;
  raw_markdown: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}
