import React, { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BackHeader } from "@/components/BackHeader";
import { Card, Chip, EmptyState, ErrorState, Loading, Screen, Txt } from "@/components/ui";
import { RichText } from "@/components/RichText";
import { useT, pick } from "@/lib/i18n";
import { brand, radius, space, useColors } from "@/lib/theme";
import { getAttempt } from "@/services/attempts";
import { loadTest } from "@/services/offline";

const L = ["A", "B", "C", "D", "E", "F"];
type Filter = "all" | "wrong" | "skipped";

export default function Solutions() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const practice = mode === "practice";
  const { t, lang } = useT();
  const c = useColors();
  const [filter, setFilter] = useState<Filter>(practice ? "wrong" : "all");
  const [picked, setPicked] = useState<Record<number, number>>({});
  const q = useQuery({
    queryKey: ["solutions", id],
    queryFn: async () => {
      const a = await getAttempt(String(id));
      const test = a ? await loadTest(a.user_id, a.test_key) : null;
      return a && test?.key_ ? { a, test, key: test.key_ } : null;
    },
  });

  const rows = useMemo(() => {
    if (!q.data) return [];
    const { a, test, key } = q.data;
    return test.questions.map((qq, i) => ({ i, qq, mine: a.answers[i] ?? null, right: key.a[i] ?? -1, sol: key.sol[i] }))
      .filter((r) => filter === "all" || (filter === "wrong" ? r.mine !== null && r.mine !== r.right : r.mine === null));
  }, [q.data, filter]);

  if (q.isLoading) return <Screen><Loading /></Screen>;
  if (!q.data) return <Screen><BackHeader title={t("solutions")} /><ErrorState message={t("noSolutions")} /></Screen>;

  return (
    <Screen scroll={false}>
      <BackHeader title={practice ? t("wrongPractice") : t("solutions")} subtitle={q.data.a.title} />
      {!practice ? (
        <View style={{ flexDirection: "row", padding: space.lg, paddingBottom: 0 }}>
          <Chip label={t("all")} active={filter === "all"} onPress={() => setFilter("all")} />
          <Chip label={t("incorrect")} active={filter === "wrong"} onPress={() => setFilter("wrong")} />
          <Chip label={t("unattempted")} active={filter === "skipped"} onPress={() => setFilter("skipped")} />
        </View>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.i)}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item: r }) => {
          const opts = lang === "hi" ? r.qq.options.hi : r.qq.options.en;
          const reveal = !practice || picked[r.i] !== undefined;
          return (
            <Card style={{ gap: space.sm }}>
              <Txt w="semibold" size={13} color={brand.navy}>{`${t("question")} ${r.i + 1}`}</Txt>
              {r.qq.passage ? <View style={{ backgroundColor: c.chip, padding: space.sm, borderRadius: radius.sm }}><RichText value={pick(r.qq.passage, lang)} size={14} /></View> : null}
              <RichText value={pick(r.qq.q, lang)} w="medium" />
              {r.qq.figure ? <RichText value={r.qq.figure} /> : null}
              {opts.map((o, oi) => {
                const isRight = oi === r.right;
                const isMine = practice ? picked[r.i] === oi : r.mine === oi;
                const border = reveal && isRight ? brand.success : reveal && isMine && !isRight ? brand.error : c.border;
                return (
                  <Pressable key={oi} disabled={!practice || picked[r.i] !== undefined} onPress={() => setPicked((p) => ({ ...p, [r.i]: oi }))}
                    style={{ flexDirection: "row", gap: space.sm, alignItems: "center", borderWidth: 2, borderColor: border, borderRadius: radius.sm, padding: space.sm, backgroundColor: reveal && isRight ? brand.success + "18" : c.card }}>
                    <Txt w="bold" size={13}>{L[oi]}</Txt>
                    <View style={{ flex: 1 }}><RichText value={o} size={14} maxSvgWidth={200} /></View>
                  </Pressable>
                );
              })}
              {reveal ? (
                <>
                  {!practice ? <Txt size={13} color={r.mine === null ? c.muted : r.mine === r.right ? brand.success : brand.error}>{r.mine === null ? t("youSkipped") : `${t("yourAnswer")}: ${L[r.mine]}`}</Txt> : null}
                  {r.sol ? <View style={{ backgroundColor: c.chip, borderRadius: radius.sm, padding: space.sm }}><Txt size={13} w="semibold">{t("explanation")}</Txt><RichText value={pick(r.sol, lang)} size={14} /></View> : null}
                </>
              ) : null}
            </Card>
          );
        }}
      />
    </Screen>
  );
}
