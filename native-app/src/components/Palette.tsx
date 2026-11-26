import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { X } from "lucide-react-native";
import type { NTest } from "@/engine/types";
import { brand, radius, space, useColors } from "@/lib/theme";
import { useT } from "@/lib/i18n";
import { Button, Txt } from "./ui";

export type QState = "answered" | "notAnswered" | "notVisited" | "marked" | "markedAnswered";
export function qState(answered: boolean, visited: boolean, marked: boolean): QState {
  if (marked) return answered ? "markedAnswered" : "marked";
  if (answered) return "answered";
  return visited ? "notAnswered" : "notVisited";
}

/** Palette colours from the spec: green answered, red visited-unanswered, grey not visited, purple marked, navy outline current. */
export function PaletteCell({ n, state, current, onPress, size = 42 }: { n: number; state: QState; current: boolean; onPress: () => void; size?: number }) {
  const c = useColors();
  const bg = { answered: brand.success, notAnswered: brand.error, notVisited: c.notVisited, marked: brand.review, markedAnswered: brand.review }[state];
  const fg = state === "notVisited" ? c.notVisitedText : "#fff";
  return (
    <Pressable onPress={onPress} accessibilityLabel={`Q${n}`} style={{ width: size, height: size, borderRadius: 8, backgroundColor: bg, alignItems: "center", justifyContent: "center", borderWidth: current ? 3 : 0, borderColor: brand.navy, margin: 4 }}>
      <Txt w="semibold" size={13} color={fg}>{n}</Txt>
      {state === "markedAnswered" ? <View style={{ position: "absolute", right: 3, bottom: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: brand.success, borderWidth: 1, borderColor: "#fff" }} /> : null}
    </Pressable>
  );
}

export function Legend({ counts }: { counts: Record<QState, number> }) {
  const { t } = useT();
  const c = useColors();
  const items: [string, string, number][] = [
    [brand.success, t("answered"), counts.answered],
    [brand.error, t("notAnswered"), counts.notAnswered],
    [c.notVisited, t("notVisited"), counts.notVisited],
    [brand.review, t("marked"), counts.marked + counts.markedAnswered],
  ];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
      {items.map(([col, label, n]) => (
        <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: col }} />
          <Txt size={12}>{`${label} (${n})`}</Txt>
        </View>
      ))}
    </View>
  );
}

export function PaletteModal({ visible, onClose, test, states, current, onJump, onSubmit, sectionName }: {
  visible: boolean; onClose: () => void; test: NTest; states: QState[]; current: number; onJump: (i: number) => void; onSubmit: () => void; sectionName: (i: number) => string;
}) {
  const { t } = useT();
  const c = useColors();
  const counts = states.reduce((m, s) => ({ ...m, [s]: m[s] + 1 }), { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, markedAnswered: 0 } as Record<QState, number>);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: c.bg, maxHeight: "85%", borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
            <Txt w="bold" size={17} style={{ flex: 1 }}>{t("palette")}</Txt>
            <Pressable onPress={onClose} accessibilityLabel={t("cancel")} hitSlop={10}><X color={c.text} size={22} /></Pressable>
          </View>
          <Legend counts={counts} />
          <ScrollView style={{ marginTop: space.md }}>
            {test.sections.map((_, si) => (
              <View key={si} style={{ marginBottom: space.md }}>
                <Txt w="semibold" size={14} style={{ marginBottom: 4 }}>{sectionName(si)}</Txt>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {test.questions.map((q, i) => (q.section === si ? (
                    <PaletteCell key={i} n={i + 1} state={states[i] ?? "notVisited"} current={i === current} onPress={() => { onJump(i); onClose(); }} />
                  ) : null))}
                </View>
              </View>
            ))}
          </ScrollView>
          <Button title={t("submit")} kind="danger" onPress={onSubmit} style={{ marginTop: space.sm }} />
        </View>
      </View>
    </Modal>
  );
}
