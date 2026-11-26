import React, { useMemo } from "react";
import { Alert, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, Lock, PlayCircle, RotateCcw } from "lucide-react-native";
import { BackHeader } from "@/components/BackHeader";
import { Card, ErrorState, Pill, Screen, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { brand, space, useColors } from "@/lib/theme";
import { seriesById, testKey } from "@/data/catalog";
import { useAuth, useCtx } from "@/store/auth";
import { useAttempts, useUid } from "@/hooks/data";
import { fetchTest, looksUnlocked, ownedHubProducts } from "@/services/tests";
import { listDownloads, saveTest } from "@/services/offline";
import { markingText } from "@/lib/marking";

export default function SeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const series = seriesById(String(id));
  const { t, p, lang } = useT();
  const c = useColors();
  const ctx = useCtx();
  const uid = useUid();
  const profileLoaded = useAuth((s) => !!s.profile);
  const attempts = useAttempts();
  const owned = useQuery({
    queryKey: ["hub-owned", uid, series?.product],
    enabled: !!series?.product && !!ctx,
    queryFn: () => ownedHubProducts(ctx!, [series!.product!]),
  });
  const downloads = useQuery({ queryKey: ["downloads", uid], enabled: !!uid, queryFn: () => listDownloads(uid!) });

  const byTest = useMemo(() => {
    const m = new Map<string, { inProgress: boolean; best: number | null; max: number | null; tries: number }>();
    for (const a of attempts.data ?? []) {
      if (a.series_id !== series?.id) continue;
      const e = m.get(a.test_key) ?? { inProgress: false, best: null, max: null, tries: 0 };
      if (a.status === "in_progress") e.inProgress = true;
      if (a.result) {
        e.tries++;
        e.best = e.best === null ? a.result.score : Math.max(e.best, a.result.score);
        e.max = a.result.max;
      }
      m.set(a.test_key, e);
    }
    return m;
  }, [attempts.data, series?.id]);

  if (!series) return <Screen><BackHeader title={t("exams")} /><ErrorState message={t("notFound")} /></Screen>;
  const hubOwned = owned.data ?? new Set<string>();
  const dl = new Set((downloads.data ?? []).map((d) => d.test_key));
  const openCount = Array.from({ length: series.count }, (_, i) => i + 1).filter((n) => looksUnlocked(series, n, ctx, hubOwned)).length;

  const download = async (n: number) => {
    if (!ctx) return;
    const r = await fetchTest(series, n, ctx);
    if (r.status === "ok" && !r.offline) {
      await saveTest(ctx.userId, r.test, "download");
      void downloads.refetch();
      Alert.alert(t("downloadedOk"));
    } else Alert.alert(r.status === "locked" ? t("lockedMsg") : t("loadError"));
  };

  return (
    <Screen>
      <BackHeader title={p(series.title)} subtitle={`${series.count} ${t("tests")} · ${series.questions} ${t("questions")} · ${series.minutes} ${t("minutes")}`} />
      <View style={{ padding: space.lg, gap: space.sm }}>
        <Card style={{ gap: 4 }}>
          <Txt w="semibold">{t("pattern")}</Txt>
          <Txt size={14} muted>{markingText(series.scoring, lang)}</Txt>
          <Txt size={13} muted>{profileLoaded || series.source === "hub" ? `${openCount}/${series.count} ${t("openForYou")}` : ""}</Txt>
          {series.examIds[0] ? (
            <Pressable onPress={() => router.push({ pathname: "/exam-info/[id]", params: { id: series.examIds[0]! } })}>
              <Txt size={14} color={brand.blue} w="medium">{t("examDetails")} →</Txt>
            </Pressable>
          ) : null}
        </Card>
        {Array.from({ length: series.count }, (_, i) => i + 1).map((n) => {
          const key = testKey(series.id, n);
          const unlocked = looksUnlocked(series, n, ctx, hubOwned);
          const info = byTest.get(key);
          return (
            <Card key={n} style={{ flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md }}
              onPress={() => (unlocked ? router.push({ pathname: "/test/[key]", params: { key } }) : Alert.alert(t("locked"), t("lockedMsg")))}
              accessibilityLabel={`${t("test")} ${n}`}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: unlocked ? c.chip : c.notVisited, alignItems: "center", justifyContent: "center" }}>
                {unlocked ? <Txt w="bold" color={brand.navy}>{n}</Txt> : <Lock color={c.muted} size={18} />}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt w="semibold">{`${t("test")} ${n}`}</Txt>
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  {info?.inProgress ? <Pill text={t("inProgress")} color={brand.review} /> : null}
                  {info?.best !== null && info?.best !== undefined ? <Pill text={`${t("best")} ${info.best}/${info.max}`} color={brand.success} /> : null}
                  {dl.has(key) ? <Pill text={t("offlineReady")} color={brand.blue} /> : null}
                  {!unlocked ? <Txt size={12} muted>{t("locked")}</Txt> : null}
                </View>
              </View>
              {unlocked && !dl.has(key) ? (
                <Pressable onPress={() => void download(n)} accessibilityLabel={t("download")} hitSlop={8} style={{ padding: 4 }}>
                  <Download color={c.muted} size={20} />
                </Pressable>
              ) : null}
              {unlocked ? (info?.inProgress ? <PlayCircle color={brand.review} size={24} /> : info?.tries ? <RotateCcw color={brand.navy} size={22} /> : <CheckCircle2 color={brand.navy} size={22} />) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
