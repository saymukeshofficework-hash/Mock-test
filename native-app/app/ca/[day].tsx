import React from "react";
import { ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BackHeader } from "@/components/BackHeader";
import { CaItemCard } from "@/components/CaItemCard";
import { Button, Card, EmptyState, ErrorState, Loading, Screen, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { space } from "@/lib/theme";
import { useCaDay, useUid } from "@/hooks/data";
import { caBookmarks, toggleCaBookmark } from "@/services/currentAffairs";
import { formatDay } from "../(tabs)/index";

export default function CaDayScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const { t, p, lang } = useT();
  const uid = useUid();
  const ca = useCaDay(String(day));
  const saved = useQuery({ queryKey: ["ca-bm", uid], enabled: !!uid, queryFn: () => caBookmarks(uid!) });
  const ids = new Set((saved.data ?? []).map((b) => `${b.day}|${b.item.id}`));
  return (
    <Screen scroll={false}>
      <BackHeader title={t("currentAffairs")} subtitle={formatDay(String(day), lang)} />
      {ca.isLoading ? <Loading /> : ca.isError ? <ErrorState onRetry={() => void ca.refetch()} /> : !ca.data?.items.length ? <EmptyState message={t("noCaYet")} /> : (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl * 2 }}>
          {ca.data.title ? <Txt w="bold" size={17}>{p(ca.data.title)}</Txt> : null}
          {ca.data.quiz?.length ? <Button title={`${t("startQuiz")} (${ca.data.quiz.length})`} kind="yellow" onPress={() => router.push({ pathname: "/ca-quiz/[day]", params: { day: ca.data!.day } })} /> : null}
          {ca.data.items.map((it) => (
            <CaItemCard key={it.id} item={it} saved={ids.has(`${ca.data!.day}|${it.id}`)} onToggle={uid ? async () => { await toggleCaBookmark(uid, ca.data!.day, it); void saved.refetch(); } : undefined} />
          ))}
          {ca.data.oneliners && (lang === "hi" ? ca.data.oneliners.hi : ca.data.oneliners.en).length ? (
            <Card style={{ gap: 4 }}>
              <Txt w="semibold">{t("oneLiners")}</Txt>
              {(lang === "hi" ? ca.data.oneliners.hi : ca.data.oneliners.en).map((o, i) => <Txt key={i} size={14}>{`• ${o}`}</Txt>)}
            </Card>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}
