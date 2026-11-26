import React, { useEffect } from "react";
import { BackHandler, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, RotateCcw, BookOpenCheck } from "lucide-react-native";
import { Button, Card, ErrorState, Header, Loading, ProgressBar, Ring, Screen, SectionTitle, Txt } from "@/components/ui";
import { useT, pick } from "@/lib/i18n";
import { brand, space } from "@/lib/theme";
import { getAttempt, previousResult } from "@/services/attempts";
import { retryQueued } from "@/services/submit";
import { loadTest } from "@/services/offline";
import { parseTestKey } from "@/data/catalog";
import { accuracy } from "@/engine/scoring";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["attempt", id],
    queryFn: async () => {
      let a = await getAttempt(String(id));
      if (a?.status === "queued") {
        await retryQueued(a.user_id);
        a = await getAttempt(String(id));
        void qc.invalidateQueries({ queryKey: ["attempts"] });
      }
      if (!a) return null;
      const prev = a.result ? await previousResult(a.user_id, a.test_key, a.id) : null;
      const test = await loadTest(a.user_id, a.test_key);
      return { a, prev, hasSolutions: !!test?.key_ };
    },
  });
  useEffect(() => {
    const bh = BackHandler.addEventListener("hardwareBackPress", () => { router.replace("/my-tests"); return true; });
    return () => bh.remove();
  }, []);

  if (q.isLoading) return <Screen><Loading /></Screen>;
  if (!q.data) return <Screen><ErrorState onRetry={() => void q.refetch()} /></Screen>;
  const { a, prev, hasSolutions } = q.data;
  const parsed = parseTestKey(a.test_key);
  const r = a.result;

  if (!r) {
    return (
      <Screen>
        <Header title={t("result")} subtitle={a.title} />
        <Card style={{ margin: space.lg, gap: space.md }}>
          <Txt w="semibold">{t("queued")}</Txt>
          <Button title={t("retry")} onPress={() => void q.refetch()} loading={q.isFetching} />
          <Button title={t("myTests")} kind="secondary" onPress={() => router.replace("/my-tests")} />
        </Card>
      </Screen>
    );
  }
  const acc = accuracy(r);
  const pct = r.max ? Math.max(0, r.score / r.max) : 0;
  const diff = prev?.result ? Math.round((r.score - prev.result.score) * 100) / 100 : null;
  const weak = [...r.sections].filter((s) => s.total > 0).sort((x, y) => x.c / x.total - y.c / y.total).slice(0, 2).filter((s) => s.c / s.total < 0.6);
  const mins = Math.floor(r.timeSec / 60), secs = r.timeSec % 60;

  return (
    <Screen>
      <Header title={t("result")} subtitle={a.title}>
        <View style={{ alignItems: "center", marginTop: space.lg }}>
          <Ring value={pct}>
            <Txt w="bold" size={28} color="#fff">{String(r.score)}</Txt>
            <Txt size={13} color="rgba(255,255,255,0.8)">{`/ ${r.max}`}</Txt>
          </Ring>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: space.lg }}>
          <Stat label={t("accuracy")} value={`${acc}%`} />
          <Stat label={t("timeTaken")} value={`${mins}m ${secs}s`} />
          <Stat label={t("vsLast")} value={diff === null ? "—" : `${diff > 0 ? "+" : ""}${diff}`} />
        </View>
      </Header>

      <View style={{ paddingHorizontal: space.lg, marginTop: space.lg, flexDirection: "row", gap: space.sm }}>
        <Count label={t("correct")} value={r.correct} color={brand.success} />
        <Count label={t("incorrect")} value={r.incorrect} color={brand.error} />
        <Count label={t("unattempted")} value={r.unattempted} color="#6B7280" />
      </View>
      <Txt size={12} muted style={{ paddingHorizontal: space.lg, marginTop: space.sm }}>{t("rankUnavailable")}</Txt>

      <SectionTitle title={t("subjectWise")} />
      <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
        {r.sections.map((s, i) => (
          <Card key={i} style={{ padding: space.md, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Txt w="medium" style={{ flex: 1 }}>{pick(s.name, lang) || `${t("section")} ${i + 1}`}</Txt>
              <Txt w="semibold">{`${s.c}/${s.total}`}</Txt>
            </View>
            <ProgressBar value={s.total ? s.c / s.total : 0} color={s.total && s.c / s.total >= 0.6 ? brand.success : brand.yellow} />
            <Txt size={12} muted>{`${t("correct")} ${s.c} · ${t("incorrect")} ${s.ic} · ${t("unattempted")} ${s.un}`}</Txt>
          </Card>
        ))}
      </View>

      {weak.length ? (
        <Card style={{ margin: space.lg, gap: 6 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Lightbulb color={brand.yellow} size={20} />
            <Txt w="semibold">{t("improve")}</Txt>
          </View>
          {weak.map((s, i) => <Txt key={i} size={14}>{`• ${pick(s.name, lang)}: ${Math.round((s.c / s.total) * 100)}% ${t("correctLower")}`}</Txt>)}
        </Card>
      ) : null}

      <View style={{ paddingHorizontal: space.lg, gap: space.sm, marginTop: space.md }}>
        {hasSolutions ? (
          <>
            <Button title={t("solutions")} icon={<BookOpenCheck color="#fff" size={18} />} onPress={() => router.push({ pathname: "/solutions/[id]", params: { id: a.id } })} />
            {r.incorrect > 0 ? <Button title={t("retryWrong")} kind="secondary" icon={<RotateCcw color={brand.navy} size={18} />} onPress={() => router.push({ pathname: "/solutions/[id]", params: { id: a.id, mode: "practice" } })} /> : null}
          </>
        ) : <Txt size={13} muted center>{t("noSolutions")}</Txt>}
        {parsed ? <Button title={t("retake")} kind="secondary" onPress={() => router.replace({ pathname: "/test/[key]", params: { key: a.test_key } })} /> : null}
        <Button title={t("myTests")} kind="ghost" onPress={() => router.replace("/my-tests")} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Txt w="bold" size={17} color="#fff">{value}</Txt>
      <Txt size={12} color="rgba(255,255,255,0.8)">{label}</Txt>
    </View>
  );
}
function Count({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={{ flex: 1, alignItems: "center", padding: space.md }}>
      <Txt w="bold" size={20} color={color}>{String(value)}</Txt>
      <Txt size={12} muted>{label}</Txt>
    </Card>
  );
}
