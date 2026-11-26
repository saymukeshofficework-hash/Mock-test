import type { ExpoConfig } from "expo/config";

// APP_VARIANT=preview  -> separate app id (installs next to the Play Store app)
// APP_VARIANT=production -> in.tettesthub.app (same id as the current TWA on Play)
const variant = process.env.APP_VARIANT ?? "preview";
const isProd = variant === "production";
// Play Console's latest uploaded versionCode must be checked before a production build.
// The TWA manifest in this repo says 3, so the first native release must be 4 or higher.
const versionCode = Number(process.env.ANDROID_VERSION_CODE ?? 4);

const config: ExpoConfig = {
  name: isProd ? "TETTESTHUB" : "TETTESTHUB Preview",
  slug: "tettesthub",
  scheme: "tettesthub",
  version: "2.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: { image: "./assets/splash-icon.png", resizeMode: "contain", backgroundColor: "#19336F" },
  android: {
    package: isProd ? "in.tettesthub.app" : "in.tettesthub.app.preview",
    versionCode,
    adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: "#19336F" },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: "resize",
    blockedPermissions: ["android.permission.RECORD_AUDIO", "android.permission.SYSTEM_ALERT_WINDOW"],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    "expo-font",
    "expo-web-browser",
    ["expo-notifications", { color: "#19336F" }],
    ["expo-splash-screen", { image: "./assets/splash-icon.png", imageWidth: 180, backgroundColor: "#19336F" }],
  ],
  experiments: { typedRoutes: false },
  extra: { variant },
};

export default config;
