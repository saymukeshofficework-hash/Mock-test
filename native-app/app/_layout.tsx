import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, NotoSansDevanagari_400Regular, NotoSansDevanagari_500Medium, NotoSansDevanagari_600SemiBold, NotoSansDevanagari_700Bold } from "@expo-google-fonts/noto-sans-devanagari";
import { useAuth } from "@/store/auth";
import { useColors, useIsDark } from "@/lib/theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } } });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ NotoSansDevanagari_400Regular, NotoSansDevanagari_500Medium, NotoSansDevanagari_600SemiBold, NotoSansDevanagari_700Bold });
  const ready = useAuth((s) => s.ready);
  const session = useAuth((s) => s.session);
  const init = useAuth((s) => s.init);
  const c = useColors();
  const dark = useIsDark();

  useEffect(() => {
    void init();
  }, [init]);
  useEffect(() => {
    if (fontsLoaded && ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, ready]);

  if (!fontsLoaded || !ready) return null;
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={dark ? "light" : "light"} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: "slide_from_right" }}>
            <Stack.Protected guard={!session}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={!!session}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="test/[key]" options={{ gestureEnabled: false, animation: "fade" }} />
              <Stack.Screen name="series/[id]" />
              <Stack.Screen name="exam-info/[id]" />
              <Stack.Screen name="result/[id]" options={{ gestureEnabled: false }} />
              <Stack.Screen name="solutions/[id]" />
              <Stack.Screen name="ca/[day]" />
              <Stack.Screen name="ca-quiz/[day]" />
              <Stack.Screen name="bookmarks" />
              <Stack.Screen name="change-password" />
            </Stack.Protected>
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
