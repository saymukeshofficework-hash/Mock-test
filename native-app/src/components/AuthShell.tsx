import React, { type ReactNode } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, View, type TextInputProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { brand, font, radius, space, useColors } from "@/lib/theme";
import { Txt } from "./ui";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const c = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brand.navy }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", paddingVertical: space.xl * 1.5 }}>
            <Image source={require("../../assets/icon.png")} style={{ width: 72, height: 72, borderRadius: 16 }} accessibilityIgnoresInvertColors />
            <Txt w="bold" size={24} color="#fff" style={{ marginTop: space.md }}>TETTESTHUB</Txt>
            <Txt size={13} color="rgba(255,255,255,0.8)">MP • TET • Police • Railway</Txt>
          </View>
          <View style={{ flex: 1, backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, gap: space.md }}>
            <Txt w="bold" size={22}>{title}</Txt>
            {subtitle ? <Txt muted size={14}>{subtitle}</Txt> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Txt w="medium" size={13}>{label}</Txt>
      <TextInput
        placeholderTextColor={c.muted}
        accessibilityLabel={label}
        {...props}
        style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: c.text, fontFamily: font.regular, minHeight: 50 }}
      />
    </View>
  );
}

export function FormError({ text }: { text: string | null }) {
  if (!text) return null;
  return <Txt size={13} color={brand.error} accessibilityLiveRegion="polite">{text}</Txt>;
}
