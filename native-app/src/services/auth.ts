import { supabase } from "@/lib/supabase";
import { LINKS, MAIN_SUPABASE_ANON_KEY, MAIN_SUPABASE_URL, STUDENT_EMAIL_DOMAIN } from "@/lib/config";

/** Same mapping as the website (js/auth.js normalizeIdentifier). */
export function normalizeIdentifier(input: string): string {
  const v = input.trim();
  if (v.includes("@")) return v.toLowerCase();
  const digits = v.replace(/\D/g, "");
  if (/^\d{10}$/.test(v)) return `91${digits}@${STUDENT_EMAIL_DOMAIN}`;
  if (/^91\d{10}$/.test(v)) return `${digits}@${STUDENT_EMAIL_DOMAIN}`;
  return `${v.toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
}

export type Profile = {
  student_id: string | null;
  full_name: string | null;
  package: string | null;
  purchased_tests: string[] | null;
  status: string | null;
};

export async function signIn(identifier: string, password: string) {
  const email = normalizeIdentifier(identifier);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // The website keeps one active device per account.
  await supabase.auth.signOut({ scope: "others" }).catch(() => undefined);
  return data.session;
}

export async function signUp(fullName: string, identifier: string, password: string) {
  if (password.length < 6) throw new Error("password_short");
  const email = normalizeIdentifier(identifier);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName.trim(), contact_identifier: identifier.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: LINKS.resetRedirect });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  if (password.length < 6) throw new Error("password_short");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("student_id, full_name, package, purchased_tests, status")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

/**
 * Pulls test series bought on the website into the profile (same Edge Function the website calls).
 * Read-only for payments: it never starts a purchase.
 */
export async function syncWebsitePurchases(accessToken: string): Promise<void> {
  try {
    await fetch(`${MAIN_SUPABASE_URL}/functions/v1/tet-unlock`, {
      method: "POST",
      headers: { apikey: MAIN_SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {
    // offline: the profile from the last sync still applies
  }
}

export function authErrorKey(e: unknown): "badLogin" | "network" | "passwordShort" | "exists" | "generic" {
  const msg = e instanceof Error ? e.message.toLowerCase() : String(e).toLowerCase();
  if (msg.includes("password_short") || msg.includes("at least 6")) return "passwordShort";
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) return "badLogin";
  if (msg.includes("already registered") || msg.includes("already exists")) return "exists";
  if (msg.includes("network") || msg.includes("fetch")) return "network";
  return "generic";
}
