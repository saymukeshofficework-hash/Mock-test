import React, { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { space, useColors } from "@/lib/theme";
import { useT } from "@/lib/i18n";
import { Txt } from "./ui";

export function BackHeader({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children?: ReactNode }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={{ backgroundColor: c.header, paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel={t("back")} hitSlop={10}>
          <ArrowLeft color="#fff" size={22} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt w="bold" size={17} color="#fff" numberOfLines={2}>{title}</Txt>
          {subtitle ? <Txt size={12} color="rgba(255,255,255,0.8)">{subtitle}</Txt> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}
