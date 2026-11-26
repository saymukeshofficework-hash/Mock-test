import "react-native-url-polyfill/auto";
import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { MAIN_SUPABASE_ANON_KEY, MAIN_SUPABASE_URL } from "./config";
import { secureSessionStorage } from "./secureSessionStorage";

export const supabase = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_ANON_KEY, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: "tth-auth",
  },
});

// Refresh tokens only while the app is in the foreground (Supabase RN guidance).
AppState.addEventListener("change", (s) => {
  if (s === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
