import React, { useMemo } from "react";
import { Alert, Linking, Pressable, Switch, View } from "react-native";
import { router } from "expo-router";
import Constants from "expo-constants";
import { ChevronRight, FileText, HelpCircle, KeyRound, LogOut, MessageCircle, Shield, Trash2, Bookmark } from "@/components/icons";
import { Button, Card, Chip, Header, Screen, SectionTitle, Txt } from "@/components/ui";
import { useT, type StrKey } from "@/lib/i18n";
import { brand, space, useColors } from "@/lib/theme";
import { LINKS } from "@/lib/config";
import { useAuth } from "@/store/auth";
import { useSettings, type NotifPrefs, type ThemeMode } from "@/store/settings";
import { useAttempts } from "@/hooks/data";
import { ensurePermission, syncReminders } from "@/services/notifications";

const NOTIF: { k: keyof NotifPrefs; label: StrKey }[] = [
  { k: "dailyCA", label: "notifDailyCA" }, { k: "examReminders", label: "notifExam" },
  { k: "studyReminder", label: "notifStudy" }, { k: "incompleteTest", label: "notifIncomplete" },
];

export default function Profile() {
  const { t } = useT();
  const c = useColors();
  const profile = useAuth((s) => s.profile);
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const s = useSettings();
  const attempts = useAttempts();

  const stats = useMemo(() => {
    const done = (attempts.data ?? []).filter((a) => a.status === "submitted" && a.result && a.result.max > 0);
    const avg = done.length ? Math.round((done.reduce((x, a) => x + Math.max(0, a.result!.score) / a.result!.max, 0) / done.length) * 100) : null;
    const incomplete = (attempts.data ?? []).some((a) => a.status === "in_progress");
    return { taken: done.length, avg, incomplete };
  }, [attempts.data]);

  const email = session?.user.email ?? "";
  const shownEmail = email.endsWith("@students.tettesthub.app") ? "" : email;
  const name = profile?.full_name?.trim() || profile?.student_id || shownEmail || "";

  const setNotif = async (k: keyof NotifPrefs, v: boolean) => {
    if (v && !(await ensurePermission())) { Alert.alert(t("notifications"), t("notifDenied")); return; }
    s.setNotif({ [k]: v });
    await syncReminders({ ...s.notif, [k]: v }, s.lang, stats.incomplete);
  };

  const row = (icon: React.ReactNode, label: string, onPress: () => void, danger = false) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: 12, minHeight: 48 }}>
      {icon}
      <Txt w="medium" style={{ flex: 1 }} color={danger ? brand.error : undefined}>{label}</Txt>
      <ChevronRight color={c.muted} size={18} />
    </Pressable>
  );
  const ic = (I: typeof Shield, color = c.muted) => <I color={color} size={20} />;

  return (
    <Screen>
      <Header title={t("profile")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.md }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: brand.yellow, alignItems: "center", justifyContent: "center" }}>
            <Txt w="bold" size={22} color="#1B2440">{(name[0] ?? "T").toUpperCase()}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt w="bold" size={18} color="#fff">{name}</Txt>
            {profile?.student_id ? <Txt size={13} color="rgba(255,255,255,0.85)">{`ID: ${profile.student_id}`}</Txt> : null}
            {shownEmail ? <Txt size={13} color="rgba(255,255,255,0.85)">{shownEmail}</Txt> : null}
          </View>
        </View>
      </Header>
      <View style={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: "row", gap: space.md }}>
          <Card style={{ flex: 1, alignItems: "center" }}><Txt w="bold" size={22}>{String(stats.taken)}</Txt><Txt size={12} muted>{t("testsTaken")}</Txt></Card>
          <Card style={{ flex: 1, alignItems: "center" }}><Txt w="bold" size={22}>{stats.avg === null ? "—" : `${stats.avg}%`}</Txt><Txt size={12} muted>{t("avgScore")}</Txt></Card>
        </View>
        <Txt size={12} muted>{t("statsDevice")}</Txt>

        <SectionTitle title={t("language")} />
        <View style={{ flexDirection: "row" }}>
          <Chip label="हिंदी" active={s.lang === "hi"} onPress={() => s.setLang("hi")} />
          <Chip label="English" active={s.lang === "en"} onPress={() => s.setLang("en")} />
        </View>
        <SectionTitle title={t("theme")} />
        <View style={{ flexDirection: "row" }}>
          {(["system", "light", "dark"] as ThemeMode[]).map((m) => <Chip key={m} label={t(m)} active={s.theme === m} onPress={() => s.setTheme(m)} />)}
        </View>
        <SectionTitle title={t("dailyGoal")} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <Button small kind="secondary" title="−" onPress={() => s.setDailyGoal(s.dailyGoal - 1)} />
          <Txt w="bold" size={18}>{`${s.dailyGoal} ${t("tests")}`}</Txt>
          <Button small kind="secondary" title="+" onPress={() => s.setDailyGoal(s.dailyGoal + 1)} />
        </View>

        <SectionTitle title={t("notifications")} />
        <Card style={{ paddingVertical: 4 }}>
          {NOTIF.map((n) => (
            <View key={n.k} style={{ flexDirection: "row", alignItems: "center", minHeight: 48 }}>
              <Txt style={{ flex: 1 }}>{t(n.label)}</Txt>
              <Switch value={s.notif[n.k]} onValueChange={(v) => void setNotif(n.k, v)} trackColor={{ true: brand.blue, false: c.border }} accessibilityLabel={t(n.label)} />
            </View>
          ))}
        </Card>

        <Card style={{ paddingVertical: 0 }}>
          {row(ic(Bookmark), t("bookmarks"), () => router.push("/bookmarks"))}
          {row(ic(KeyRound), t("changePassword"), () => router.push("/change-password"))}
          {row(ic(MessageCircle), t("help"), () => void Linking.openURL(LINKS.whatsapp))}
          {row(ic(HelpCircle), "FAQ", () => void Linking.openURL(LINKS.help))}
          {row(ic(Shield), t("privacy"), () => void Linking.openURL(LINKS.privacy))}
          {row(ic(FileText), t("terms"), () => void Linking.openURL(LINKS.terms))}
          {row(ic(Trash2, brand.error), t("deleteAccount"), () => Alert.alert(t("deleteAccount"), t("deleteAccountMsg"), [
            { text: t("cancel"), style: "cancel" },
            { text: t("open"), onPress: () => void Linking.openURL(LINKS.deleteAccount) },
          ]), true)}
        </Card>
        <Button title={t("logout")} kind="danger" icon={<LogOut color="#fff" size={18} />} onPress={() => Alert.alert(t("logout"), t("logoutMsg"), [
          { text: t("cancel"), style: "cancel" },
          { text: t("logout"), style: "destructive", onPress: () => void logout() },
        ])} />
        <Txt size={12} muted center>{`${t("version")} ${Constants.expoConfig?.version ?? ""}`}</Txt>
      </View>
    </Screen>
  );
}
