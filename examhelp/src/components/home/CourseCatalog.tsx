"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import type { Lang } from "@/types";

/** Minimal course catalogue (same look as the tettesthub.in homepage). */

type Course = {
  f: string[];
  tone: string;
  art: "book" | "test" | "combo";
  kick: string;
  big: string;
  sub: string[];
  isNew?: boolean;
  tags: string[];
  meta: [string, string];
  title: string;
  desc: string;
  price: number;
  mrp?: number;
  from?: boolean;
  /** link at the site root (outside /examhelp) */
  abs?: boolean;
  href: string;
};

const TONES: Record<string, string> = {
  teal: "bg-[#0f766e] text-white",
  ink: "bg-[#1f2937] text-white",
  amber: "bg-[#f2c46d] text-[#2a1f08]",
  indigo: "bg-[#3f4a9a] text-white",
  sage: "bg-[#dfe9df] text-[#1f3326]",
};

const COURSES = (lang: Lang): Course[] => {
  const hi = lang === "hi";
  return [
    {
      f: ["new", "tests"], tone: "teal", art: "test", isNew: true,
      kick: hi ? "MP हाई कोर्ट • 1174 पद" : "MP High Court • 1174 posts", big: hi ? "सहायक ग्रेड-3 2026" : "Assistant Grade-3 2026",
      sub: hi ? ["25 फुल टेस्ट", "टेस्ट 1 फ्री"] : ["25 full tests", "Test 1 free"],
      tags: hi ? ["MP हाई कोर्ट", "टेस्ट सीरीज़"] : ["MP High Court", "Test series"],
      meta: [hi ? "हर टेस्ट" : "Each test", hi ? "100 प्रश्न · 120 मिनट" : "100 Qs · 120 min"],
      title: hi ? "MP हाई कोर्ट सहायक ग्रेड-3 2026 — 25 फुल मॉक टेस्ट" : "MP High Court Assistant Grade-3 2026 — 25 full mock tests",
      desc: hi ? "✅ आधिकारिक पैटर्न: 5 खंड, 100 प्रश्न ✅ टेस्ट 1 फ्री ✅ हिंदी/English, हर प्रश्न की व्याख्या" : "✅ Official pattern: 5 sections, 100 Qs ✅ Test 1 free ✅ Hindi/English, explanation for every question",
      price: 199, href: "/mp-high-court-assistant-grade-3-mock-tests",
    },
    {
      f: ["new", "notes"], tone: "amber", art: "book", isNew: true,
      kick: hi ? "रोज़ अपडेट • MP + भारत + विश्व" : "Daily • MP + India + World", big: hi ? "दैनिक करेंट अफेयर्स" : "Daily Current Affairs",
      sub: hi ? ["रोज़ की खबरें", "PDF डाउनलोड", "क्विज़"] : ["Daily news", "PDF download", "Quiz"],
      tags: hi ? ["करेंट अफेयर्स", "नया"] : ["Current affairs", "New"],
      meta: [hi ? "पास" : "Pass", hi ? "30 दिन · ₹49" : "30 days · ₹49"],
      title: hi ? "दैनिक करेंट अफेयर्स — मध्यप्रदेश, भारत व अंतरराष्ट्रीय" : "Daily Current Affairs — Madhya Pradesh, India & World",
      desc: hi ? "✅ हर दिन MP, भारत व विश्व की प्रमुख खबरें ✅ वन-लाइनर व क्विज़ ✅ आज के करेंट अफेयर्स की PDF डाउनलोड" : "✅ Key MP, India and world news every day ✅ One-liners and quiz ✅ Download today's current affairs as PDF",
      price: 49, href: "/current-affairs",
    },
    {
      f: ["new", "tests"], tone: "indigo", art: "test", isNew: true,
      kick: hi ? "MP पुलिस • 7500 पद" : "MP Police • 7500 posts", big: hi ? "आरक्षक (जी.डी.) 2026" : "Constable (GD) 2026",
      sub: hi ? ["25 फुल टेस्ट", "टेस्ट 1 फ्री"] : ["25 full tests", "Test 1 free"],
      tags: hi ? ["MP पुलिस", "टेस्ट सीरीज़"] : ["MP Police", "Test series"], meta: [hi ? "हर टेस्ट" : "Each test", hi ? "100 प्रश्न · 120 मिनट" : "100 Qs · 120 min"],
      title: hi ? "MP पुलिस आरक्षक (जी.डी.) 2026 — 25 फुल मॉक टेस्ट" : "MP Police Constable (GD) 2026 — 25 full mock tests",
      desc: hi ? "✅ MPESB पैटर्न: 3 खंड, 100 प्रश्न ✅ टेस्ट 1 फ्री ✅ हिंदी/English, हर प्रश्न की व्याख्या" : "✅ MPESB pattern: 3 sections, 100 Qs ✅ Test 1 free ✅ Hindi/English, explanation for every question",
      price: 199, href: "/mp-police-constable-gd-mock-tests",
    },
    {
      f: ["new", "tests"], tone: "sage", art: "test", isNew: true,
      kick: hi ? "MP पुलिस • 655 पद" : "MP Police • 655 posts", big: hi ? "सूबेदार / ASI 2026" : "Subedar / ASI 2026",
      sub: hi ? ["25 फुल टेस्ट", "टेस्ट 1 फ्री"] : ["25 full tests", "Test 1 free"],
      tags: hi ? ["MP पुलिस", "टेस्ट सीरीज़"] : ["MP Police", "Test series"], meta: [hi ? "हर टेस्ट" : "Each test", hi ? "100 प्रश्न · 120 मिनट" : "100 Qs · 120 min"],
      title: hi ? "MP पुलिस सूबेदार (शीघ्रलेखक) / ASI 2026 — 25 फुल मॉक टेस्ट" : "MP Police Subedar (Steno) / ASI 2026 — 25 full mock tests",
      desc: hi ? "✅ MPESB पैटर्न: 3 खंड, 100 प्रश्न ✅ टेस्ट 1 फ्री ✅ 12वीं स्तर, हिंदी/English व्याख्या सहित" : "✅ MPESB pattern: 3 sections, 100 Qs ✅ Test 1 free ✅ Class 12 level, Hindi/English with explanations",
      price: 199, href: "/mp-police-subedar-asi-mock-tests",
    },
    {
      f: ["tests"], tone: "ink", art: "test",
      kick: hi ? "TET • शिक्षक पात्रता परीक्षा" : "TET • Teacher Eligibility Test", big: hi ? "TET मॉक टेस्ट सीरीज़" : "TET Mock Test Series",
      sub: hi ? ["25 फुल टेस्ट", "टेस्ट 1 फ्री"] : ["25 full tests", "Test 1 free"],
      tags: hi ? ["TET", "टेस्ट सीरीज़"] : ["TET", "Test series"], meta: [hi ? "हर टेस्ट" : "Each test", hi ? "150 प्रश्न · 150 मिनट" : "150 Qs · 150 min"],
      title: hi ? "TET मॉक टेस्ट सीरीज़ — 25 फुल-लेंथ टेस्ट (हिंदी/English)" : "TET Mock Test Series — 25 full-length tests (Hindi/English)",
      desc: hi ? "✅ टेस्ट 1 बिल्कुल फ्री ✅ बाकी 24 टेस्ट एक बंडल में ✅ असली परीक्षा जैसा इंटरफ़ेस" : "✅ Test 1 free ✅ Other 24 in one bundle ✅ Real exam interface",
      price: 199, href: "/tests.html", abs: true,
    },
    {
      f: ["notes"], tone: "indigo", art: "book",
      kick: "NIOS • B.Ed", big: hi ? "ब्रिज कोर्स नोट्स" : "Bridge Course Notes", sub: hi ? ["डिजिटल नोट्स", "तुरंत एक्सेस"] : ["Digital notes", "Instant access"],
      tags: hi ? ["B.Ed ब्रिज कोर्स", "PDF नोट्स"] : ["B.Ed Bridge Course", "PDF notes"], meta: [hi ? "प्रकार" : "Type", hi ? "डिजिटल नोट्स" : "Digital notes"],
      title: hi ? "NIOS B.Ed ब्रिज कोर्स — संपूर्ण डिजिटल नोट्स" : "NIOS B.Ed Bridge Course — Complete digital notes",
      desc: hi ? "✅ ब्रिज कोर्स के सभी विषय ✅ परीक्षा व असाइनमेंट के लिए ✅ भुगतान के बाद तुरंत एक्सेस" : "✅ All bridge course subjects ✅ For exams and assignments ✅ Instant access after payment",
      price: 199, href: "/bridge-course/", abs: true,
    },
  ];
};

function Art({ kind }: { kind: Course["art"] }) {
  if (kind === "book")
    return (
      <svg className="absolute -right-3 -bottom-4 w-[46%]" viewBox="0 0 120 90" aria-hidden="true">
        <rect x="22" y="14" width="62" height="74" rx="6" fill="rgba(255,255,255,.22)" />
        <rect x="32" y="6" width="62" height="74" rx="6" fill="rgba(255,255,255,.9)" />
        <rect x="42" y="20" width="40" height="5" rx="2.5" fill="currentColor" opacity=".55" />
        <rect x="42" y="32" width="32" height="4" rx="2" fill="currentColor" opacity=".3" />
        <rect x="42" y="42" width="38" height="4" rx="2" fill="currentColor" opacity=".3" />
        <rect x="42" y="52" width="26" height="4" rx="2" fill="currentColor" opacity=".3" />
      </svg>
    );
  return (
    <svg className="absolute -right-3 -bottom-4 w-[46%]" viewBox="0 0 120 90" aria-hidden="true">
      {kind === "combo" ? <rect x="16" y="16" width="56" height="70" rx="6" fill="rgba(255,255,255,.85)" /> : null}
      <rect x={kind === "combo" ? 50 : 28} y="8" width={kind === "combo" ? 62 : 70} height="80" rx="8" fill="rgba(255,255,255,.92)" />
      <g fill="currentColor" opacity=".5">
        <circle cx={kind === "combo" ? 63 : 42} cy="26" r="4" />
        <circle cx={kind === "combo" ? 63 : 42} cy="44" r="4" />
        <circle cx={kind === "combo" ? 63 : 42} cy="62" r="4" />
      </g>
      <g fill="currentColor" opacity=".22">
        <rect x={kind === "combo" ? 71 : 52} y="23" width="30" height="5" rx="2.5" />
        <rect x={kind === "combo" ? 71 : 52} y="41" width="25" height="5" rx="2.5" />
        <rect x={kind === "combo" ? 71 : 52} y="59" width="28" height="5" rx="2.5" />
      </g>
    </svg>
  );
}

export function CourseCatalog({ lang }: { lang: Lang }) {
  const courses = useMemo(() => COURSES(lang), [lang]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const chips: [string, string][] = lang === "hi"
    ? [["all", "सभी"], ["new", "नए कोर्स"], ["notes", "PDF नोट्स"], ["tests", "टेस्ट सीरीज़"]]
    : [["all", "All"], ["new", "New"], ["notes", "PDF notes"], ["tests", "Test series"]];
  const shown = courses.filter((c) => {
    const okF = filter === "all" || c.f.includes(filter);
    const hay = [c.title, c.big, c.kick, c.desc, ...c.tags, ...c.sub].join(" ").toLowerCase();
    return okF && (!q.trim() || hay.includes(q.trim().toLowerCase()));
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {chips.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} aria-pressed={filter === k}
              className={`shrink-0 rounded-full border px-4 py-2 text-[15px] transition-colors ${filter === k ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-surface text-ink-900 hover:border-ink-300"}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-full border border-ink-200 bg-surface px-4 py-2 sm:w-72">
          <Search className="h-4 w-4 text-ink-500" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" aria-label={lang === "hi" ? "कोर्स खोजें" : "Search courses"}
            placeholder={lang === "hi" ? "कोर्स खोजें…" : "Search courses…"} className="w-full bg-transparent text-sm outline-none" />
        </label>
      </div>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const external = c.abs || c.href.endsWith(".html") || c.href.includes(".html?");
          const inner = (
            <>
              <div className={`relative flex aspect-[16/9] flex-col justify-between overflow-hidden p-5 ${TONES[c.tone]}`}>
                {c.isNew ? <span className="absolute top-4 right-4 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-ink-900">NEW</span> : null}
                <div>
                  <p className="text-[11.5px] font-bold tracking-wide uppercase opacity-85">{c.kick}</p>
                  <p className="mt-1 max-w-[75%] text-2xl leading-tight font-extrabold">{c.big}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.sub.map((s) => (
                    <span key={s} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{s}</span>
                  ))}
                </div>
                <Art kind={c.art} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-md border border-ink-200 bg-canvas px-2.5 py-0.5 text-xs text-ink-500">{t}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink-500">
                  {c.meta[0]}: <b className="font-semibold text-ink-900">{c.meta[1]}</b>
                </p>
                <p className="mt-2 text-lg leading-snug font-bold text-ink-900">{c.title}</p>
                <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{c.desc}</p>
                <div className="mt-auto flex items-center justify-between border-t border-ink-200 pt-4">
                  <span className="text-2xl font-extrabold text-ink-900">
                    {c.price ? `₹${c.price}` : <span className="text-brand-700">{lang === "hi" ? "फ्री" : "Free"}</span>}
                    {c.mrp ? <s className="ml-1.5 text-base font-medium text-ink-500">₹{c.mrp}</s> : null}
                    {c.from ? <small className="ml-1.5 text-sm font-semibold text-ink-500">{lang === "hi" ? "से शुरू" : "onwards"}</small> : null}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-white" aria-hidden="true">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </>
          );
          const cls = "flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-surface transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]";
          return (
            <li key={c.title}>
              {external ? <a href={c.abs ? c.href : `${base}${c.href}`} className={cls}>{inner}</a> : <Link href={c.href} className={cls}>{inner}</Link>}
            </li>
          );
        })}
      </ul>
      {shown.length === 0 ? <p className="py-10 text-center text-ink-500">{lang === "hi" ? "कुछ नहीं मिला।" : "Nothing found."}</p> : null}
    </div>
  );
}
