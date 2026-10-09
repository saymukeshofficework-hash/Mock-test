import type { Metadata } from "next";
import { site } from "./site";

/** Consistent per-page metadata: title, description, canonical, OG, Twitter. */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  image,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Path of a 1200×630 image in /public, e.g. "/og/page.png". */
  image?: string;
}): Metadata {
  const url = `${site.url}${path}`;
  // Absolute URL so the GitHub Pages sub-path is not added twice.
  const images = image ? [{ url: `${site.url}${image}`, width: 1200, height: 630, alt: title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, siteName: site.name, type, locale: "hi_IN", alternateLocale: ["en_IN"], images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  description: site.seo.description,
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  inLanguage: ["hi-IN", "en-IN"],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});
