import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BackHeader } from "@/components/BackHeader";
import { CaItemCard } from "@/components/CaItemCard";
import { RichText } from "@/components/RichText";
import { Button, Card, Chip, EmptyState, Loading, Screen, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { space } from "@/lib/theme";
import { useUid } from "@/hooks/data";
import { listBookmarks, removeBookmark } from "@/services/offline";
import { caBookmarks, toggleCaBookmark } from "@/services/currentAffairs";
import { formatDay } from "./(tabs)/index";

type QB = { title?: string; section?: string; q?: { hi?: string; en?: string } | string; options?: unknown; n?: number };

export default function Bookmarks() {
  const { t, p, lang } = useT();
  const uid = useUid();
  const [tab, setTab] = useState<"q" | "ca">("q");
  const qs = useQuery({ queryKey: ["q-bm", uid], enabled: !!uid, queryFn: () => listBookmarks<QB>(uid!) });
  const cas = useQuery({ queryKey: ["ca-bm", uid], enabled: !!uid, queryFn: () => caBookmarks(uid!) });
  const qText = (q: QB["q"]) => (typeof q === "string" ? q : q ? p({ hi: q.hi ?? q.en ?? "", en: q.en ?? q.hi ?? "" }) : "");
  return (
    <Screen scroll={false}>
      <BackHeader title={t("bookmarks")} />
      <View style={{ flexDirection: "row", paddingHorizontal: space.lg, paddingTop: space.md }}>
        <Chip label={`${t("questions")} (${qs.data?.length ?? 0})`} active={tab === "q"} onPress={() => setTab("q")} />
        <Chip label={`${t("caShort")} (${cas.data?.length ?? 0})`} active={tab === "ca"} onPress={() => setTab("ca")} />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}>
        {(tab === "q" ? qs.isLoading : cas.isLoading) ? <Loading /> : null}
        {tab === "q" ? (
          qs.data?.length ? qs.data.map((b) => (
            <Card key={`${b.test_key}|${b.q_index}`} style={{ gap: 6 }}>
              <Txt size={12} muted>{`${b.data.title ?? b.test_key} · ${t("question")} ${b.data.n ?? b.q_index + 1}`}</Txt>
              <RichText value={qText(b.data.q)} />
              <View style={{ flexDirection: "row", gap: space.sm }}>
                <Button small kind="secondary" title={t("open")} onPress={() => router.push({ pathname: "/test/[key]", params: { key: b.test_key } })} />
                <Button small kind="ghost" title={t("clear")} onPress={async () => { await removeBookmark(uid!, b.test_key, b.q_index); void qs.refetch(); }} />
              </View>
            </Card>
          )) : !qs.isLoading ? <EmptyState /> : null
        ) : cas.data?.length ? cas.data.map((b) => (
          <View key={`${b.day}|${b.item.id}`} style={{ gap: 4 }}>
            <Txt size={12} muted onPress={() => router.push({ pathname: "/ca/[day]", params: { day: b.day } })}>{formatDay(b.day, lang)}</Txt>
            <CaItemCard item={b.item} saved onToggle={async () => { await toggleCaBookmark(uid!, b.day, b.item); void cas.refetch(); }} />
          </View>
        )) : !cas.isLoading ? <EmptyState /> : null}
      </ScrollView>
    </Screen>
  );
}
