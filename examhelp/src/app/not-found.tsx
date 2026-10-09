import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { SearchBox } from "@/components/home/SearchBox";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="container-page flex flex-col items-center py-16 text-center sm:py-24">
      <p className="text-7xl font-extrabold text-brand-100 sm:text-8xl">404</p>
      <h1 className="mt-2 text-2xl font-bold text-brand-900 sm:text-3xl">
        {lang === "hi" ? "यह पृष्ठ नहीं मिला" : "This page could not be found"}
      </h1>
      <p className="mt-2 max-w-md text-ink-500">
        {lang === "hi" ? "हो सकता है लिंक पुराना हो। नीचे अपनी परीक्षा खोजें।" : "The link may be outdated. Search for your exam below."}
      </p>
      <div className="mt-8 w-full max-w-2xl text-left">
        <SearchBox lang={lang} />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-navy">
          <Home className="h-4 w-4" aria-hidden="true" /> {tr(dict.common.backHome, lang)}
        </Link>
        <Link href="/exams" className="btn-outline">
          <Compass className="h-4 w-4" aria-hidden="true" /> {tr(dict.exam.allExams, lang)}
        </Link>
      </div>
    </div>
  );
}
