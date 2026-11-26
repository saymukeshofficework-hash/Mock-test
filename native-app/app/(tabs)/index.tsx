import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Bell, CalendarDays, Check, ChevronRight, Newspaper, PlayCircle, Target, Trophy } from "lucide-react-native";
import { Button, Card, Header, Pill, ProgressBar, Screen, SectionTitle, Skeleton, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { brand, radius, space, useColors } from "@/lib/theme";
import { useAuth } from "@/store/auth";
import { useSettings } from "@/store/settings";
import { useAttempts, useCaDay, useStudyStats } from "@/hooks/data";
import { upcomingExams } from "@/services/exams";
import { localDay } from "@/services/attempts";
import { SERIES, seriesById } from "@/data/catalog";

export default function Home() {
  const { t, p, lang } = useT();
  const c = useColors();
  const profile = useAuth((s) => s.profile);
  const goal = useSettings((s) => s.dailyGoal);
  const stats = useStudyStats();
  const inProgress = useAttempts("in_progress");
  const done = useAttempts("submitted");
  const ca = useCaDay();
  const exams = useMemo(() => upcomingExams().slice(0, 3), []);

  const name = profile?.full_name?.trim() || profile?.student_id || "";
  const resume = inProgress.data?.[0];
  const answered = resume ? resume.answers.filter((a) => a !== null).length : 0;
  const recentSeries = useMemo(() => {
    const ids: string[] = [];
    for (const a of [...(inProgress.data ?? []), ...(done.data ?? [])]) if (!ids.includes(a.series_id)) ids.push(a.series_id);
    return ids.slice(0, 3).map(seriesById).filter((s) => !!s);
  }, [inProgress.data, done.data]);
  const recommended = useMemo(() => {
    const examIds = new Set(exams.map((e) => e.exam.id));
    const near = SERIES.filter((s) => s.examIds.some((id) => examIds.has(id)) && !recentSeries.some((r) => r?.id === s.id));
    return near.slice(0, 4);
  }, [exams, recentSeries]);

  const week = useMemo(() => {
    const out: { key: string; label: string; on: boolean }[] = [];
    const base = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      out.push({ key: localDay(d), label: d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "narrow" }), on: !!stats.data?.days.has(localDay(d)) });
    }
    return out;
  }, [stats.data, lang]);
  const streak = useMemo(() => {
    let n = 0;
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i]?.on) n++;
      else if (i === week.length - 1) continue; // today not done yet keeps yesterday's streak
      else break;
    }
    return n;
  }, [week]);

  const refresh = () => {
    void stats.refetch();
    void inProgress.refetch();
    void ca.refetch();
  };

  return (
    <Screen refreshing={ca.isRefetching} onRefresh={refresh}>
      <Header
        title={`${t("hello")}${name ? `, ${name}` : ""} 👋`}
        subtitle={new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}
        right={
          <View style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
            <Pressable onPress={() => router.push("/profile")} accessibilityLabel={t("notifications")} hitSlop={8}>
              <Bell color="#fff" size={22} />
            </Pressable>
            <Pressable onPress={() => router.push("/profile")} accessibilityLabel={t("profile")} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: brand.yellow, alignItems: "center", justifyContent: "center" }}>
              <Txt w="bold" color="#1B2440">{(name[0] ?? "T").toUpperCase()}</Txt>
            </Pressable>
          </View>
        }
      >
        <View style={{ marginTop: space.lg, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.md, padding: space.md, gap: space.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Target color={brand.yellow} size={18} />
            <Txt w="semibold" color="#fff" style={{ flex: 1 }}>{t("dailyGoal")}</Txt>
            <Txt w="bold" color="#fff">{stats.data ? `${Math.min(stats.data.today, goal)}/${goal}` : "–"}</Txt>
          </View>
          <ProgressBar value={stats.data ? stats.data.today / goal : 0} color={brand.yellow} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            {week.map((d) => (
              <View key={d.key} style={{ alignItems: "center", gap: 2 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: d.on ? brand.success : "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                  {d.on ? <Check color="#fff" size={16} /> : null}
                </View>
                <Txt size={11} color="rgba(255,255,255,0.8)">{d.label}</Txt>
              </View>
            ))}
          </View>
          <Txt size={12} color="rgba(255,255,255,0.85)">{streak > 0 ? `🔥 ${streak} ${t("dayStreak")}` : t("startStreak")}</Txt>
        </View>
      </Header>

      <View style={{ paddingHorizontal: space.lg, gap: space.md, marginTop: space.lg }}>
        {resume ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <PlayCircle color={brand.blue} size={20} />
              <Txt w="semibold" style={{ flex: 1 }}>{t("continueTest")}</Txt>
            </View>
            <Txt w="medium" numberOfLines={2}>{resume.title}</Txt>
            <Txt size={13} muted style={{ marginVertical: 6 }}>{`${answered}/${resume.q_count} ${t("answeredLower")} · ${Math.ceil(resume.remaining_sec / 60)} ${t("minLeft")}`}</Txt>
            <ProgressBar value={answered / Math.max(1, resume.q_count)} />
            <Button title={t("resume")} onPress={() => router.push({ pathname: "/test/[key]", params: { key: resume.test_key } })} style={{ marginTop: space.md }} />
          </Card>
        ) : null}

        <Card style={{ backgroundColor: brand.yellow, borderColor: brand.yellow }} onPress={() => router.push("/current-affairs")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Newspaper color="#1B2440" size={20} />
            <Txt w="bold" color="#1B2440" style={{ flex: 1 }}>{t("todayCA")}</Txt>
            {ca.data ? <Pill text={formatDay(ca.data.day, lang)} color="#1B2440" bg="rgba(0,0,0,0.08)" /> : null}
          </View>
          {ca.isLoading ? <Skeleton height={40} style={{ marginTop: 8, backgroundColor: "rgba(0,0,0,0.06)" }} /> : ca.data ? (
            <View style={{ marginTop: 8, gap: 2 }}>
              {ca.data.items.slice(0, 3).map((it) => (
                <Txt key={it.id} size={14} color="#1B2440" numberOfLines={1}>• {p(it.title)}</Txt>
              ))}
            </View>
          ) : <Txt size={13} color="#1B2440" style={{ marginTop: 6 }}>{ca.isError ? t("loadError") : t("noCaYet")}</Txt>}
          <Txt w="semibold" color={brand.navy} style={{ marginTop: 8 }}>{t("readNow")} →</Txt>
        </Card>

        {ca.data?.quiz?.length ? (
          <Card onPress={() => router.push({ pathname: "/ca-quiz/[day]", params: { day: ca.data!.day } })}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Trophy color={brand.review} size={22} />
              <View style={{ flex: 1 }}>
                <Txt w="semibold">{t("quiz")}</Txt>
                <Txt size={13} muted>{`${ca.data.quiz.length} ${t("questions")}`}</Txt>
              </View>
              <Button title={t("startQuiz")} small onPress={() => router.push({ pathname: "/ca-quiz/[day]", params: { day: ca.data!.day } })} />
            </View>
          </Card>
        ) : null}
      </View>

      <SectionTitle title={t("upcoming")} right={<CalendarDays color={c.muted} size={18} />} />
      <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
        {exams.length === 0 ? <Txt muted>{t("noUpcoming")}</Txt> : exams.map((e) => (
          <Card key={e.exam.id} onPress={() => router.push({ pathname: "/exam-info/[id]", params: { id: e.exam.id } })} style={{ flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md }}>
            <View style={{ width: 54, alignItems: "center", backgroundColor: c.chip, borderRadius: radius.sm, paddingVertical: 6 }}>
              <Txt w="bold" size={18} color={brand.navy}>{e.days}</Txt>
              <Txt size={10} muted>{t("daysLeft")}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="semibold" numberOfLines={2}>{p(e.exam.name)}</Txt>
              <Txt size={12} muted>{`${formatDay(e.date, lang)} · ${statusLabel(e.status, lang)}`}</Txt>
            </View>
            <ChevronRight color={c.muted} size={18} />
          </Card>
        ))}
      </View>

      {recentSeries.length ? (
        <>
          <SectionTitle title={t("recentSeries")} />
          <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
            {recentSeries.map((s) => (
              <Card key={s!.id} onPress={() => router.push({ pathname: "/series/[id]", params: { id: s!.id } })} style={{ padding: space.md, flexDirection: "row", alignItems: "center" }}>
                <Txt w="medium" style={{ flex: 1 }}>{p(s!.title)}</Txt>
                <ChevronRight color={c.muted} size={18} />
              </Card>
            ))}
          </View>
        </>
      ) : null}

      {recommended.length ? (
        <>
          <SectionTitle title={t("recommended")} />
          <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
            {recommended.map((s) => (
              <Card key={s.id} onPress={() => router.push({ pathname: "/series/[id]", params: { id: s.id } })} style={{ padding: space.md }}>
                <Txt w="medium">{p(s.title)}</Txt>
                <Txt size={12} muted>{`${s.count} ${t("tests")} · ${s.questions} ${t("questions")} · ${s.minutes} ${t("minutes")}`}</Txt>
              </Card>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

export function formatDay(day: string, lang: string) {
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function statusLabel(s: string, lang: string) {
  const m: Record<string, [string, string]> = {
    CONFIRMED: ["पक्की तिथि", "Confirmed"],
    TENTATIVE: ["संभावित", "Tentative"],
    EXPECTED: ["अपेक्षित", "Expected"],
    TBA: ["घोषित होना बाकी", "To be announced"],
    COMPLETED: ["हो चुकी", "Completed"],
  };
  const v = m[s];
  return v ? (lang === "hi" ? v[0] : v[1]) : s;
}
