import React, { type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type TextProps, type ViewStyle, type StyleProp, RefreshControl } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { AlertCircle, Inbox } from "@/components/icons";
import { brand, font, radius, shadow, space, useColors } from "@/lib/theme";
import { useT } from "@/lib/i18n";

type TxtProps = TextProps & { w?: keyof typeof font; size?: number; color?: string; muted?: boolean; center?: boolean };
export function Txt({ w = "regular", size = 15, color, muted, center, style, ...rest }: TxtProps) {
  const c = useColors();
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.4}
      style={[{ fontFamily: font[w], fontSize: size, color: color ?? (muted ? c.muted : c.text), lineHeight: Math.round(size * 1.45), textAlign: center ? "center" : undefined }, style]}
    />
  );
}

export function Screen({ children, scroll = true, edges = ["top"], refreshing, onRefresh, style }: { children: ReactNode; scroll?: boolean; edges?: Edge[]; refreshing?: boolean; onRefresh?: () => void; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingBottom: space.xl * 2 }, style]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[brand.navy]} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, right, children }: { title?: string; subtitle?: string; right?: ReactNode; children?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: c.header, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          {title ? <Txt w="bold" size={20} color={c.headerText}>{title}</Txt> : null}
          {subtitle ? <Txt size={13} color="rgba(255,255,255,0.8)">{subtitle}</Txt> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const c = useColors();
  const base: ViewStyle = { backgroundColor: c.card, borderRadius: radius.md, padding: space.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border, ...shadow };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

type BtnKind = "primary" | "secondary" | "yellow" | "danger" | "ghost";
export function Button({ title, onPress, kind = "primary", disabled, loading, icon, style, small }: { title: string; onPress?: () => void; kind?: BtnKind; disabled?: boolean; loading?: boolean; icon?: ReactNode; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const c = useColors();
  const bg = { primary: brand.navy, secondary: c.chip, yellow: brand.yellow, danger: brand.error, ghost: "transparent" }[kind];
  const fg = { primary: "#fff", secondary: c.text, yellow: "#1B2440", danger: "#fff", ghost: brand.blue }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: radius.sm, paddingVertical: small ? 8 : 12, paddingHorizontal: small ? 12 : 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, minHeight: small ? 36 : 48, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : icon}
      <Txt w="semibold" size={small ? 13 : 15} color={fg}>{title}</Txt>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: active ? brand.navy : c.chip, marginRight: space.sm, minHeight: 36, justifyContent: "center" }}
    >
      <Txt w="medium" size={13} color={active ? "#fff" : c.text}>{label}</Txt>
    </Pressable>
  );
}

export function ProgressBar({ value, color = brand.blue, height = 8 }: { value: number; color?: string; height?: number }) {
  const c = useColors();
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, backgroundColor: c.skeleton, borderRadius: height, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}>
      <View style={{ width: `${v * 100}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function Ring({ value, size = 132, stroke = 12, color = brand.yellow, track = "rgba(255,255,255,0.18)", children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${C} ${C}`} strokeDashoffset={C * (1 - v)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      {children}
    </View>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.xl, marginBottom: space.sm, paddingHorizontal: space.lg }}>
      <Txt w="bold" size={17}>{title}</Txt>
      {right}
    </View>
  );
}

export function Skeleton({ height = 80, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ height, borderRadius: radius.md, backgroundColor: c.skeleton }, style]} />;
}

export function Loading() {
  return (
    <View style={{ padding: space.xl, alignItems: "center" }}>
      <ActivityIndicator color={brand.navy} size="large" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ padding: space.xl, alignItems: "center", gap: space.md }}>
      <AlertCircle color={c.muted} size={36} />
      <Txt center muted>{message ?? t("loadError")}</Txt>
      {onRetry ? <Button title={t("retry")} onPress={onRetry} kind="secondary" small /> : null}
    </View>
  );
}

export function EmptyState({ message }: { message?: string }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ padding: space.xl, alignItems: "center", gap: space.sm }}>
      <Inbox color={c.muted} size={32} />
      <Txt center muted>{message ?? t("empty")}</Txt>
    </View>
  );
}

export function Pill({ text, color = brand.blue, bg }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={{ backgroundColor: bg ?? color + "22", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, alignSelf: "flex-start" }}>
      <Txt w="semibold" size={11} color={color}>{text}</Txt>
    </View>
  );
}
