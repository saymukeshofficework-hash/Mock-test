import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Bookmark, BookmarkCheck } from "@/components/icons";
import type { CaItem } from "@/services/currentAffairs";
import { useT } from "@/lib/i18n";
import { brand, space, useColors } from "@/lib/theme";
import { Card, Pill, Txt } from "./ui";

export function CaItemCard({ item, saved, onToggle }: { item: CaItem; saved?: boolean; onToggle?: () => void }) {
  const { p, lang } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const pts = lang === "hi" ? item.points.hi : item.points.en;
  return (
    <Card onPress={() => setOpen((o) => !o)} style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.sm }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Pill text={item.cat} />
          <Txt w="semibold">{p(item.title)}</Txt>
        </View>
        {onToggle ? (
          <Pressable onPress={onToggle} hitSlop={10} accessibilityLabel="bookmark">
            {saved ? <BookmarkCheck color={brand.blue} size={22} /> : <Bookmark color={c.muted} size={22} />}
          </Pressable>
        ) : null}
      </View>
      {(open ? pts : pts.slice(0, 1)).map((pt, i) => <Txt key={i} size={14} muted={!open}>{`• ${pt}`}</Txt>)}
    </Card>
  );
}
