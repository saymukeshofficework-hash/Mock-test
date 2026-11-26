import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, BookOpen, GraduationCap, Landmark, Search, Shield, TrainFront, Users } from "lucide-react-native";
import { Card, Chip, EmptyState, Header, Screen, Txt } from "@/components/ui";
import { useT, type StrKey } from "@/lib/i18n";
import { brand, font, radius, space, useColors } from "@/lib/theme";
import { CATEGORIES, SERIES, type Category, type Series } from "@/data/catalog";
import { EXAMS } from "@/services/exams";

const CAT_LABEL: Record<Category, StrKey> = { mp: "catMP", police: "catPolice", teaching: "catTeaching", railway: "catRailway", ssc: "catSSC", other: "catOther" };
const CAT_ICON: Record<Category, typeof Shield> = { mp: Landmark, police: Shield, teaching: GraduationCap, railway: TrainFront, ssc: BadgeCheck, other: Users };

export default function Exams() {
  const { t, p } = useT();
  const c = useColors();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SERIES.filter((s) => (cat === "all" || s.category === cat) && (!needle || `${s.title.hi} ${s.title.en}`.toLowerCase().includes(needle)));
  }, [q, cat]);
  const examHits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return EXAMS.filter((e) => `${e.name.hi} ${e.name.en} ${e.shortName}`.toLowerCase().includes(needle)).slice(0, 5);
  }, [q]);

  const renderItem = ({ item }: { item: Series }) => {
    const Icon = CAT_ICON[item.category];
    return (
      <Card onPress={() => router.push({ pathname: "/series/[id]", params: { id: item.id } })} style={{ flex: 1, margin: space.xs, padding: space.md, minHeight: 150 }} accessibilityLabel={p(item.title)}>
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: c.chip, alignItems: "center", justifyContent: "center", marginBottom: space.sm }}>
          <Icon color={brand.navy} size={22} />
        </View>
        <Txt w="semibold" size={14} numberOfLines={3} style={{ flex: 1 }}>{p(item.title)}</Txt>
        <Txt size={12} muted>{`${item.count} ${t("tests")} · ${item.questions} ${t("questions")}`}</Txt>
      </Card>
    );
  };

  return (
    <Screen scroll={false}>
      <Header title={t("exams")}>
        <View style={{ marginTop: space.md, flexDirection: "row", alignItems: "center", backgroundColor: c.card, borderRadius: radius.sm, paddingHorizontal: 12 }}>
          <Search color={c.muted} size={18} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t("search")}
            placeholderTextColor={c.muted}
            accessibilityLabel={t("search")}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontFamily: font.regular, fontSize: 15, color: c.text, minHeight: 44 }}
          />
        </View>
      </Header>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: space.lg, paddingBottom: space.sm }}>
          <Chip label={t("all")} active={cat === "all"} onPress={() => setCat("all")} />
          {CATEGORIES.map((k) => <Chip key={k} label={t(CAT_LABEL[k])} active={cat === k} onPress={() => setCat(k)} />)}
        </ScrollView>
      </View>
      <FlatList
        data={list}
        keyExtractor={(s) => s.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xl * 2 }}
        ListHeaderComponent={examHits.length ? (
          <View style={{ paddingHorizontal: space.xs, marginBottom: space.sm, gap: space.sm }}>
            {examHits.map((e) => (
              <Card key={e.id} onPress={() => router.push({ pathname: "/exam-info/[id]", params: { id: e.id } })} style={{ padding: space.md, flexDirection: "row", gap: 8, alignItems: "center" }}>
                <BookOpen color={brand.blue} size={18} />
                <Txt w="medium" style={{ flex: 1 }}>{p(e.name)}</Txt>
              </Card>
            ))}
          </View>
        ) : null}
        ListEmptyComponent={<EmptyState message={t("noMatch")} />}
      />
    </Screen>
  );
}
