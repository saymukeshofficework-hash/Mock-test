import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SERIES } from "@/data/catalog";
import { getProfile, syncWebsitePurchases, type Profile } from "@/services/auth";
import { wipeUser } from "@/services/db";
import { clearSeriesTokens } from "@/services/hub";
import { dropOfflineKey } from "@/services/offline";
import type { Ctx } from "@/services/tests";

type AuthState = {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  recovery: boolean;
  init: () => Promise<void>;
  refreshProfile: (sync?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

let started = false;

export const useAuth = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  profile: null,
  recovery: false,
  async init() {
    if (started) return;
    started = true;
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, recovery: event === "PASSWORD_RECOVERY" ? true : get().recovery });
      if (event === "SIGNED_IN") void get().refreshProfile(true);
      if (event === "SIGNED_OUT") set({ profile: null });
    });
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, ready: true });
    if (data.session) void get().refreshProfile(true);
  },
  async refreshProfile(sync = false) {
    const s = get().session;
    if (!s) return;
    if (sync) await syncWebsitePurchases(s.access_token);
    try {
      set({ profile: await getProfile(s.user.id) });
    } catch {
      // keep the last profile while offline
    }
  },
  async logout() {
    const s = get().session;
    if (s) {
      const uid = s.user.id;
      await wipeUser(uid).catch(() => undefined);
      await dropOfflineKey(uid).catch(() => undefined);
      await clearSeriesTokens(uid, [...new Set(SERIES.flatMap((x) => (x.product ? [x.product] : [])))]).catch(() => undefined);
    }
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    set({ session: null, profile: null, recovery: false });
  },
}));

export function useCtx(): Ctx | null {
  const session = useAuth((s) => s.session);
  const profile = useAuth((s) => s.profile);
  if (!session) return null;
  return { userId: session.user.id, accessToken: session.access_token, purchased: profile?.purchased_tests ?? [] };
}
