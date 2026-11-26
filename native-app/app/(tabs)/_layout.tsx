import React from "react";
import { Tabs } from "expo-router";
import { BookOpen, Home, ListChecks, Newspaper, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, font, useColors, useIsDark } from "@/lib/theme";
import { useT } from "@/lib/i18n";

export default function TabsLayout() {
  const { t } = useT();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const dark = useIsDark();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? brand.yellow : brand.navy,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border, height: 60 + insets.bottom, paddingBottom: 6 + insets.bottom, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home"), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="exams" options={{ title: t("exams"), tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="my-tests" options={{ title: t("myTests"), tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }} />
      <Tabs.Screen name="current-affairs" options={{ title: t("caShort"), tabBarIcon: ({ color, size }) => <Newspaper color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("profile"), tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
