import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { CA_REMINDER } from "@/lib/config";
import { tr } from "@/lib/i18n";
import type { Lang } from "@/store/settings";
import { upcomingExams } from "./exams";

/**
 * Local reminders only. Remote push (FCM) needs a Firebase google-services.json that is not in
 * the repo yet, so nothing here pretends to be a server push. See docs/BLOCKERS.md.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", { name: "Reminders", importance: Notifications.AndroidImportance.DEFAULT });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** 05:00 Asia/Kolkata (UTC+5:30) expressed in the device's own time zone. */
export function istToLocal(hour: number, minute: number, now = new Date()): { hour: number; minute: number } {
  const utcMin = hour * 60 + minute - 330;
  const localMin = (((utcMin - now.getTimezoneOffset()) % 1440) + 1440) % 1440;
  return { hour: Math.floor(localMin / 60), minute: localMin % 60 };
}

export type NotifPrefs = { dailyCA: boolean; studyReminder: boolean; examReminders: boolean; incompleteTest: boolean };

/** Rebuilds every scheduled reminder from the current preferences. */
export async function syncReminders(prefs: NotifPrefs, lang: Lang, hasIncomplete: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(prefs.dailyCA || prefs.studyReminder || prefs.examReminders || prefs.incompleteTest)) return;
  if (!(await ensurePermission())) return;
  const channelId = "reminders";
  if (prefs.dailyCA) {
    const t = istToLocal(CA_REMINDER.hour, CA_REMINDER.minute);
    await Notifications.scheduleNotificationAsync({
      content: { title: tr(lang, "todayCA"), body: tr(lang, "caReminderBody"), data: { url: "/current-affairs" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: t.hour, minute: t.minute, channelId },
    });
  }
  if (prefs.studyReminder) {
    await Notifications.scheduleNotificationAsync({
      content: { title: tr(lang, "dailyGoal"), body: tr(lang, "studyReminderBody"), data: { url: "/" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0, channelId },
    });
  }
  if (prefs.incompleteTest && hasIncomplete) {
    await Notifications.scheduleNotificationAsync({
      content: { title: tr(lang, "continueTest"), body: tr(lang, "incompleteReminderBody"), data: { url: "/my-tests" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 6 * 3600, channelId },
    });
  }
  if (prefs.examReminders) {
    // One reminder 3 days before, at 09:00, for exams with a confirmed date only.
    for (const e of upcomingExams().filter((x) => x.status === "CONFIRMED")) {
      const at = new Date(`${e.date}T09:00:00`);
      at.setDate(at.getDate() - 3);
      if (at.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: lang === "hi" ? e.exam.name.hi : e.exam.name.en, body: tr(lang, "examReminderBody"), data: { url: `/exam-info/${e.exam.id}` } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId },
      });
    }
  }
}
