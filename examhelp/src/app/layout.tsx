import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-devanagari/devanagari-400.css";
import "@fontsource/noto-sans-devanagari/devanagari-500.css";
import "@fontsource/noto-sans-devanagari/devanagari-600.css";
import "@fontsource/noto-sans-devanagari/devanagari-700.css";
import "./globals.css";
import { Analytics } from "@/components/layout/Analytics";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsAppHelp } from "@/components/layout/WhatsAppHelp";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { JsonLd } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: "%s | TETTESTHUB" },
  description: site.seo.description,
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "hi_IN", type: "website", title: site.seo.title, description: site.seo.description, url: site.url },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
  robots: { index: true, follow: true },
  verification: site.analytics.gscVerification ? { google: site.analytics.gscVerification } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#163377",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-brand-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          {tr(dict.nav.skip, lang)}
        </a>
        <Header lang={lang} />
        <a href="/" aria-label="होम पेज पर जाएँ" title="होम" className="fixed bottom-24 right-3 z-[100] flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-teal-700 text-white shadow-lg hover:bg-teal-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:bottom-5 sm:right-5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-7h6v7" /></svg>
        </a>
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer lang={lang} />
        <BottomNav lang={lang} />
        <WhatsAppHelp />
        <OfflineBanner lang={lang} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
