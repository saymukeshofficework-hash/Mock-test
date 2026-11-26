import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy } from "lucide-react-native";
import { Button, Card, Chip, EmptyState, ErrorState, Header, Loading, Screen, Txt } from "@/components/ui";
import { CaItemCard } from "@/components/CaItemCard";
import { useT, type StrKey } from "@/lib/i18n";
import { brand, font, radius, space, useColors } from "@/lib/theme";
import { useCaDay, useCaIndex, useUid } from "@/hooks/data";
import { CA_FILTERS, caBookmarks, caFilterOf, toggleCaBookmark, type CaFilter } from "@/services/currentAffairs";

const F_LABEL: Record<CaFilter, StrKey> = { all: "all", mp: "catMP", national: "caNational", international: "caInternational", sports: "caSports", schemes: "caSchemes", scitech: "caSciTech" };

export default function CurrentAffairs() {
  const { t, p, lang } = useT();
  const c = useColors();
  const uid = useUid();
  const index = useCaIndex();
  const [day, setDay] = useState<string | undefined>(undefined);
  useEffect(() => { if (!day && index.data?.[0]) setDay(index.data[0].day); }, [index.data, day]);
  const ca = useCaDay(day);
  const [filter, setFilter] = useState<CaFilter>("all");
  const [q, setQ] = useState("");
  const saved = useQuery({ queryKey: ["ca-bm", uid], enabled: !!uid, queryFn: () => caBookmarks(uid!) });
  const savedIds = new Set((saved.data ?? []).map((b) => `${b.day}|${b.item.id}`));

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (ca.data?.items ?? []).filter((it) => (filter === "all" || caFilterOf(it).includes(filter)) &&
      (!needle || `${it.title.hi} ${it.title.en} ${it.points.hi.join(" ")} ${it.points.en.join(" ")}`.toLowerCase().includes(needle)));
  }, [ca.data, filter, q]);

  const dayLabel = (d: string) => {
    const dt = new Date(`${d}T00:00:00`);
    return { dd: dt.getDate(), wd: dt.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short" }), mon: dt.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { month: "short" }) };
  };

  return (
    <Screen scroll={false}>
      <Header title={t("currentAffairs")} right={
        <Pressable onPress={() => router.push("/bookmarks")} accessibilityLabel={t("bookmarks")}><Txt color="#fff" w="medium">{t("bookmarks")}</Txt></Pressable>
      }>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }}>
          {(index.data ?? []).slice(0, 30).map((d) => {
            const l = dayLabel(d.day);
            const active = d.day === (day ?? ca.data?.day);
            return (
              <Pressable key={d.day} onPress={() => setDay(d.day)} accessibilityLabel={d.day} style={{ width: 52, alignItems: "center", paddingVertical: 6, marginRight: 6, borderRadius: radius.sm, backgroundColor: active ? brand.yellow : "rgba(255,255,255,0.12)" }}>
                <Txt size={11} color={active ? "#1B2440" : "#fff"}>{l.wd}</Txt>
                <Txt w="bold" size={17} color={active ? "#1B2440" : "#fff"}>{String(l.dd)}</Txt>
                <Txt size={10} color={active ? "#1B2440" : "rgba(255,255,255,0.8)"}>{l.mon}</Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      </Header>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}
        refreshing={ca.isRefetching}
        onRefresh={() => { void index.refetch(); void ca.refetch(); }}
        ListHeaderComponent={
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: radius.sm, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border }}>
              <Search color={c.muted} size={18} />
              <TextInput value={q} onChangeText={setQ} placeholder={t("searchCa")} placeholderTextColor={c.muted} style={{ flex: 1, padding: 10, fontFamily: font.regular, color: c.text, minHeight: 44 }} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CA_FILTERS.map((f) => <Chip key={f} label={t(F_LABEL[f])} active={filter === f} onPress={() => setFilter(f)} />)}
            </ScrollView>
            {ca.data?.title ? <Txt w="bold" size={17}>{p(ca.data.title)}</Txt> : null}
            {ca.data?.quiz?.length ? (
              <Card style={{ flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: brand.navy, borderColor: brand.navy }}>
                <Trophy color={brand.yellow} size={26} />
                <View style={{ flex: 1 }}>
                  <Txt w="semibold" color="#fff">{t("quiz")}</Txt>
                  <Txt size={13} color="rgba(255,255,255,0.8)">{`${ca.data.quiz.length} ${t("questions")}`}</Txt>
                </View>
                <Button title={t("startQuiz")} kind="yellow" small onPress={() => router.push({ pathname: "/ca-quiz/[day]", params: { day: ca.data!.day } })} />
              </Card>
            ) : null}
            {ca.isLoading || index.isLoading ? <Loading /> : null}
            {ca.isError || index.isError ? <ErrorState onRetry={() => { void index.refetch(); void ca.refetch(); }} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <CaItemCard item={item} saved={savedIds.has(`${ca.data?.day}|${item.id}`)} onToggle={uid && ca.data ? async () => { await toggleCaBookmark(uid, ca.data!.day, item); void saved.refetch(); } : undefined} />
        )}
        ListFooterComponent={<View style={{ gap: space.md }}>{ca.data?.oneliners && (lang === "hi" ? ca.data.oneliners.hi : ca.data.oneliners.en).length ? (
          <Card style={{ gap: 4, marginTop: space.md }}>
            <Txt w="semibold">{t("oneLiners")}</Txt>
            {(lang === "hi" ? ca.data.oneliners.hi : ca.data.oneliners.en).map((o, i) => <Txt key={i} size={14}>{`• ${o}`}</Txt>)}
          </Card>
        ) : null}
          {(index.data?.length ?? 0) > 30 ? (
            <View style={{ gap: space.sm, marginTop: space.md }}>
              <Txt w="semibold">{t("archive")}</Txt>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {index.data!.slice(30).map((d) => <Chip key={d.day} label={d.day} onPress={() => router.push({ pathname: "/ca/[day]", params: { day: d.day } })} />)}
              </View>
            </View>
          ) : null}
        </View>}
        ListEmptyComponent={!ca.isLoading && !ca.isError ? <EmptyState /> : null}
      />
    </Screen>
  );
}
