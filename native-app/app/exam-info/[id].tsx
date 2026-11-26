import React from "react";
import { Linking, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ExternalLink } from "@/components/icons";
import { BackHeader } from "@/components/BackHeader";
import { Button, Card, EmptyState, Pill, Screen, SectionTitle, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { brand, space } from "@/lib/theme";
import { daysUntil, examById, EXAMS_SYNCED } from "@/services/exams";
import { SERIES } from "@/data/catalog";
import { formatDay, statusLabel } from "../(tabs)/index";

const DATE_LABEL: Record<string, [string, string]> = {
  notification: ["अधिसूचना", "Notification"], applicationStart: ["आवेदन शुरू", "Application starts"], applicationEnd: ["आवेदन अंतिम तिथि", "Application ends"],
  admitCard: ["प्रवेश पत्र", "Admit card"], exam: ["परीक्षा", "Exam"], result: ["परिणाम", "Result"], answerKey: ["उत्तर कुंजी", "Answer key"],
};

export default function ExamInfo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, p, lang } = useT();
  const exam = examById(String(id));
  if (!exam) return <Screen><BackHeader title={t("examDetails")} /><EmptyState message={t("notFound")} /></Screen>;
  const related = SERIES.filter((s) => s.examIds.includes(exam.id));
  return (
    <Screen scroll={false}>
      <BackHeader title={exam.shortName} subtitle={exam.organization} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}>
        <Txt w="bold" size={18}>{p(exam.name)}</Txt>
        {exam.description ? <Txt muted>{p(exam.description)}</Txt> : null}
        <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
          {exam.posts ? <Pill text={`${exam.posts} ${lang === "hi" ? "पद" : "posts"}`} /> : null}
          {exam.mode ? <Pill text={p(exam.mode)} /> : null}
        </View>
        <SectionTitle title={t("examDate")} />
        <Card style={{ gap: space.sm }}>
          {Object.entries(exam.dates).filter(([, v]) => v).map(([k, v]) => {
            const label = DATE_LABEL[k] ? (lang === "hi" ? DATE_LABEL[k]![0] : DATE_LABEL[k]![1]) : k;
            const when = v!.date ? formatDay(v!.date, lang) + (v!.endDate ? ` – ${formatDay(v!.endDate, lang)}` : "") : v!.month ?? "—";
            const left = v!.date && v!.status === "CONFIRMED" ? daysUntil(v!.date) : null;
            return (
              <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", gap: space.sm }}>
                <Txt w="medium" style={{ flex: 1 }}>{label}</Txt>
                <View style={{ alignItems: "flex-end", flex: 1 }}>
                  <Txt>{when}</Txt>
                  <Txt size={12} muted>{statusLabel(v!.status, lang)}{left !== null && left >= 0 ? ` · ${left} ${t("daysLeft")}` : ""}</Txt>
                </View>
              </View>
            );
          })}
          <Txt size={12} muted>{`${lang === "hi" ? "अपडेट" : "Updated"}: ${formatDay(EXAMS_SYNCED, lang)}`}</Txt>
        </Card>
        {exam.pattern ? (<><SectionTitle title={t("pattern")} /><Card><Txt>{p(exam.pattern)}</Txt></Card></>) : null}
        {exam.officialUrl ? <Button title={t("officialSite")} kind="secondary" icon={<ExternalLink color={brand.navy} size={18} />} onPress={() => void Linking.openURL(exam.officialUrl!)} /> : null}
        {related.length ? (
          <>
            <SectionTitle title={t("testSeries")} />
            {related.map((s) => (
              <Card key={s.id} onPress={() => router.push({ pathname: "/series/[id]", params: { id: s.id } })}>
                <Txt w="semibold">{p(s.title)}</Txt>
                <Txt size={13} muted>{`${s.count} ${t("tests")} · ${s.questions} ${t("questions")} · ${s.minutes} ${t("minutes")}`}</Txt>
              </Card>
            ))}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
