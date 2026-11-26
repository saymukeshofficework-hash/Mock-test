import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Lang = "hi" | "en";
export type ThemeMode = "system" | "light" | "dark";
export interface NotifPrefs {
  dailyCA: boolean;
  studyReminder: boolean;
  examReminders: boolean;
  incompleteTest: boolean;
}

interface SettingsState {
  lang: Lang;
  theme: ThemeMode;
  dailyGoal: number; // tests per day
  notif: NotifPrefs;
  setLang: (l: Lang) => void;
  setTheme: (t: ThemeMode) => void;
  setDailyGoal: (n: number) => void;
  setNotif: (p: Partial<NotifPrefs>) => void;
}

// Non-sensitive preferences only. Tokens live in SecureStore, test data in encrypted SQLite.
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: "hi",
      theme: "system",
      dailyGoal: 1,
      notif: { dailyCA: true, studyReminder: false, examReminders: true, incompleteTest: true },
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal: Math.min(10, Math.max(1, Math.round(dailyGoal))) }),
      setNotif: (p) => set((s) => ({ notif: { ...s.notif, ...p } })),
    }),
    { name: "tth-settings", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
