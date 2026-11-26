import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { BackHeader } from "@/components/BackHeader";
import { Button, Card, ErrorState, Loading, ProgressBar, Ring, Screen, Txt } from "@/components/ui";
import { useT, pick } from "@/lib/i18n";
import { brand, radius, space, useColors } from "@/lib/theme";
import { useCaDay, useUid } from "@/hooks/data";
import { saveQuizScore } from "@/services/currentAffairs";

const L = ["A", "B", "C", "D", "E"];

export default function CaQuiz() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const { t, lang } = useT();
  const c = useColors();
  const uid = useUid();
  const qc = useQueryClient();
  const ca = useCaDay(String(day));
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);

  if (ca.isLoading) return <Screen><Loading /></Screen>;
  const quiz = ca.data?.quiz ?? [];
  if (!quiz.length) return <Screen><BackHeader title={t("quiz")} /><ErrorState onRetry={() => void ca.refetch()} /></Screen>;
  const score = quiz.reduce((s, q, k) => s + (picks[k] === q.a ? 1 : 0), 0);

  if (finished) {
    return (
      <Screen>
        <BackHeader title={t("quiz")} subtitle={String(day)} />
        <View style={{ alignItems: "center", padding: space.xl, gap: space.md }}>
          <Ring value={score / quiz.length} color={brand.navy} track={c.skeleton}>
            <Txt w="bold" size={28}>{`${score}/${quiz.length}`}</Txt>
          </Ring>
          <Button title={t("reviewAnswers")} kind="secondary" onPress={() => { setFinished(false); setI(0); }} />
          <Button title={t("back")} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const q = quiz[i]!;
  const opts = lang === "hi" ? q.o.hi : q.o.en;
  const mine = picks[i];
  const answered = mine !== null && mine !== undefined;
  return (
    <Screen>
      <BackHeader title={t("quiz")} subtitle={`${i + 1}/${quiz.length}`} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <ProgressBar value={(i + 1) / quiz.length} />
        <Txt w="medium" size={17}>{pick(q.q, lang)}</Txt>
        {opts.map((o, k) => {
          const right = answered && k === q.a, wrong = answered && k === mine && k !== q.a;
          return (
            <Pressable key={k} disabled={answered} onPress={() => setPicks((p) => { const x = [...p]; x[i] = k; return x; })}
              style={{ flexDirection: "row", gap: space.md, alignItems: "center", padding: space.md, borderRadius: radius.md, borderWidth: 2, borderColor: right ? brand.success : wrong ? brand.error : c.border, backgroundColor: c.card, minHeight: 52 }}>
              <Txt w="bold">{L[k]}</Txt>
              <Txt style={{ flex: 1 }}>{o}</Txt>
            </Pressable>
          );
        })}
        {answered && q.exp ? <Card><Txt size={14}>{pick(q.exp, lang)}</Txt></Card> : null}
        <View style={{ flexDirection: "row", gap: space.sm }}>
          <Button title={t("prev")} kind="secondary" disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
          {i < quiz.length - 1 ? <Button title={t("next")} onPress={() => setI(i + 1)} style={{ flex: 1 }} /> : (
            <Button title={t("finish")} onPress={async () => {
              if (uid && ca.data) { await saveQuizScore(uid, ca.data.day, score, quiz.length); void qc.invalidateQueries({ queryKey: ["attempts"] }); }
              setFinished(true);
            }} style={{ flex: 1 }} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
