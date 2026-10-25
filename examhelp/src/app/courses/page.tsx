import type { Metadata } from "next";
import { CourseCatalog } from "@/components/home/CourseCatalog";
import { getLang } from "@/i18n/server";

export const metadata: Metadata = {
  title: "All Tests — Free and Paid Mock Test Series",
  description:
    "Browse TET TestHub mock test series, including 25 completely free RRB Station Master mock tests.",
  alternates: { canonical: "/courses/" },
};

export default async function CoursesPage() {
  const lang = await getLang();
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
          {lang === "hi" ? "TET TESTHUB" : "TET TESTHUB"}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-900 sm:text-4xl">
          {lang === "hi" ? "सभी टेस्ट" : "All Tests"}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-600">
          {lang === "hi"
            ? "सभी उपलब्ध मॉक टेस्ट सीरीज़ देखें। RRB स्टेशन मास्टर के सभी 25 टेस्ट मुफ्त हैं।"
            : "Browse all available mock test series. All 25 RRB Station Master tests are free."}
        </p>
      </div>
      <CourseCatalog lang={lang} />
    </section>
  );
}
