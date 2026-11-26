import { useColorScheme } from "react-native";
import { useSettings } from "@/store/settings";

export const brand = {
  navy: "#19336F",
  blue: "#25469D",
  yellow: "#FFD34D",
  success: "#16A34A",
  error: "#DC2626",
  review: "#7C3AED",
};

const light = {
  ...brand,
  bg: "#F3F5FA",
  card: "#FFFFFF",
  text: "#172238",
  muted: "#727B8D",
  border: "#E3E7F0",
  chip: "#E8EDF8",
  header: brand.navy,
  headerText: "#FFFFFF",
  skeleton: "#E6EAF2",
  notVisited: "#E5E7EB",
  notVisitedText: "#4B5563",
  selectedBg: "#EEF2FC",
};
const dark: typeof light = {
  ...brand,
  bg: "#0D1424",
  card: "#16203A",
  text: "#E8ECF5",
  muted: "#9AA3B5",
  border: "#26304A",
  chip: "#1F2B4A",
  header: "#122652",
  headerText: "#FFFFFF",
  skeleton: "#222D48",
  notVisited: "#2B3550",
  notVisitedText: "#C7CEDD",
  selectedBg: "#1F2E57",
};
export type Colors = typeof light;

export function useColors(): Colors {
  const system = useColorScheme();
  const mode = useSettings((s) => s.theme);
  const isDark = mode === "dark" || (mode === "system" && system === "dark");
  return isDark ? dark : light;
}
export function useIsDark(): boolean {
  const system = useColorScheme();
  const mode = useSettings((s) => s.theme);
  return mode === "dark" || (mode === "system" && system === "dark");
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const font = {
  regular: "NotoSansDevanagari_400Regular",
  medium: "NotoSansDevanagari_600SemiBold",
  semibold: "NotoSansDevanagari_600SemiBold",
  bold: "NotoSansDevanagari_700Bold",
};
export const shadow = {
  shadowColor: "#0F1B3D",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
