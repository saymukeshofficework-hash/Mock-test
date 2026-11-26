import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Clock, Download, RotateCcw } from "@/components/icons";
import { Button, Card, Chip, EmptyState, Header, Loading, Pill, ProgressBar, Screen, Txt } from "@/components/ui";
import { useT, type StrKey } from "@/lib/i18n";
import { brand, space, useColors } from "@/lib/theme";
import { useAttempts, useUid } from "@/hooks/data";
import { discardAttempt, type Attempt } from "@/services/attempts";
import { listDownloads, removeTest } from "@/services/offline";
import { retryQueued } from "@/services/submit";
import { parseTestKey } from "@/data/catalog";
import { formatDay } from "./index";

type Tab = "incomplete" | "completed" | "downloaded" | "wrongPractice";
const TABS: Tab[] = ["incomplete", "completed", "downloaded", "wrongPractice"];

const fmtDate = (ms: number, lang: string) => formatDay(new Date(ms).toISOString().slice(0, 10), lang);

export default function MyTests() {
  const { t, p, lang } = useT();
  const c = useColors();
  const uid = useUid();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("incomplete");
  const all = useAttempts();
  const downloads = useQuery({ queryKey: ["downloads", uid], enabled: !!uid, queryFn: () => listDownloads(uid!) });
  useFocusEffect(React.useCallback(() => {
    if (!uid) return;
    void retryQueued(uid).then((n) => { if (n) void qc.invalidateQueries({ queryKey: ["attempts"] }); });
    void all.refetch(); void downloads.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]));

  const attempts = all.data ?? [];
  const incomplete = attempts.filter((a) => a.status !== "submitted");
  const completed = attempts.filter((a) => a.status === "submitted");
  const wrongs = completed.filter((a) => (a.result?.incorrect ?? 0) > 0);
  const counts: Record<Tab, number> = { incomplete: incomplete.length, completed: completed.length, downloaded: downloads.data?.length ?? 0, wrongPractice: wrongs.length };
  const label: Record<Tab, StrKey> = { incomplete: "incomplete", completed: "completed", downloaded: "downloaded", wrongPractice: "wrongPractice" };

  const titleOf = (key: string, fallback?: string) => {
    const pk = parseTestKey(key);
    return pk ? `${p(pk.series.title)} · ${t("test")} ${pk.n}` : fallback ?? key;
  };

  const renderAttempt = (a: Attempt) => {
    const done = a.status === "submitted" && a.result;
    const answered = a.answers.filter((x) => x !== null).length;
    return (
      <Card onPress={() => (done ? router.push({ pathname: "/result/[id]", params: { id: a.id } }) : router.push({ pathname: "/test/[key]", params: { key: a.test_key } }))} style={{ gap: 6 }}>
        <Txt w="semibold">{titleOf(a.test_key, a.title)}</Txt>
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "center", flexWrap: "wrap" }}>
          <Txt size={12} muted>{fmtDate(a.submitted_at ?? a.updated_at, lang)}</Txt>
          {a.status === "queued" ? <Pill text={t("queued")} color={brand.review} /> : null}
          {done ? <Pill text={`${t("score")} ${a.result!.score}/${a.result!.max}`} color={brand.success} /> : null}
        </View>
        {!done ? (
          <>
            <ProgressBar value={a.q_count ? answered / a.q_count : 0} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Txt size={12} muted>{`${answered}/${a.q_count} ${t("answeredLower")} · ${Math.ceil(a.remaining_sec / 60)} ${t("minLeft")}`}</Txt>
              {a.status === "in_progress" ? <Button small kind="ghost" title={t("clear")} onPress={async () => { await discardAttempt(a.id); void all.refetch(); }} /> : null}
            </View>
          </>
        ) : null}
        {tab === "wrongPractice" ? <Button small kind="secondary" title={`${t("retryWrong")} (${a.result?.incorrect ?? 0})`} onPress={() => router.push({ pathname: "/solutions/[id]", params: { id: a.id, mode: "practice" } })} /> : null}
      </Card>
    );
  };

  const data: { k: string; el: React.ReactElement }[] =
    tab === "downloaded" ? (downloads.data ?? []).map((d) => ({ k: d.test_key, el: (
      <Card onPress={() => router.push({ pathname: "/test/[key]", params: { key: d.test_key } })} style={{ gap: 6 }}>
        <Txt w="semibold">{titleOf(d.test_key)}</Txt>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Txt size={12} muted>{fmtDate(d.saved_at, lang)}</Txt>
          <Button small kind="ghost" title={t("clear")} onPress={async () => { await removeTest(uid!, d.test_key, "download"); void downloads.refetch(); }} />
        </View>
      </Card>) }))
    : (tab === "incomplete" ? incomplete : tab === "completed" ? completed : wrongs).map((a) => ({ k: a.id, el: renderAttempt(a) }));

  return (
    <Screen scroll={false}>
      <Header title={t("myTests")}>
        <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.md }}>
          {[{ icon: <Clock color="#fff" size={18} />, n: counts.incomplete, l: t("incomplete") }, { icon: <RotateCcw color="#fff" size={18} />, n: counts.completed, l: t("completed") }, { icon: <Download color="#fff" size={18} />, n: counts.downloaded, l: t("downloaded") }].map((x, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, padding: space.sm, alignItems: "center" }}>
              {x.icon}
              <Txt w="bold" size={18} color="#fff">{String(x.n)}</Txt>
              <Txt size={11} color="rgba(255,255,255,0.85)">{x.l}</Txt>
            </View>
          ))}
        </View>
      </Header>
      <FlatList
        data={data}
        keyExtractor={(d) => d.k}
        renderItem={({ item }) => item.el}
        refreshing={all.isRefetching}
        onRefresh={() => { void all.refetch(); void downloads.refetch(); }}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}
        ListHeaderComponent={
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {TABS.map((x) => <Chip key={x} label={`${t(label[x])} (${counts[x]})`} active={tab === x} onPress={() => setTab(x)} />)}
            </View>
            <Card onPress={() => router.push("/bookmarks")} style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
              <Bookmark color={brand.blue} size={20} />
              <Txt w="medium" style={{ flex: 1 }}>{t("bookmarks")}</Txt>
              <Txt color={c.muted}>›</Txt>
            </Card>
            {all.isLoading ? <Loading /> : null}
          </View>
        }
        ListEmptyComponent={!all.isLoading ? (
          <View style={{ gap: space.md }}>
            <EmptyState />
            <Button title={t("exams")} onPress={() => router.push("/exams")} />
          </View>
        ) : null}
      />
    </Screen>
  );
}
