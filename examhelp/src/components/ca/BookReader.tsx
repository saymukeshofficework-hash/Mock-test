"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { checkout, mainSiteAccessToken } from "@/lib/checkout";

type Lang = "hi" | "en";
type Book = { id: string; pages: number; hi: string; en: string };

const LAST_KEY = (id: string) => `tth_book_page_${id}`;

/** Read-only magazine reader: page images come as short-lived links for logged-in students only. */
export function BookReader() {
  const [lang, setLang] = useState<Lang>("hi");
  const [books, setBooks] = useState<Book[] | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [page, setPage] = useState(1);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "login" | "error">("idle");
  const [who, setWho] = useState("");
  const touchX = useRef<number | null>(null);
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  useEffect(() => {
    try {
      const l = (new URLSearchParams(location.search).get("lang") || localStorage.getItem("testhub_lang_pref")) as Lang | null;
      if (l === "hi" || l === "en") setLang(l);
      const s = JSON.parse(localStorage.getItem("sb-ovaubhekxjtkodkhsybg-auth-token") || "null");
      setWho(s?.user?.email || s?.user?.phone || "");
    } catch {
      /* ignore */
    }
    const onLang = (e: Event) => {
      const v = (e as CustomEvent<Lang>).detail;
      if (v === "hi" || v === "en") setLang(v);
    };
    window.addEventListener("testhub-language-change", onLang);
    checkout<{ books: Book[] }>({ action: "book_list" }).then((d) => {
      const list = d.books ?? [];
      setBooks(list);
      const q = new URLSearchParams(location.search);
      const b = list.find((x) => x.id === q.get("book"));
      if (b) open(b, parseInt(q.get("p") || "", 10));
    });
    return () => window.removeEventListener("testhub-language-change", onLang);
  }, []);

  const load = useCallback(async (b: Book, from: number) => {
    const access_token = await mainSiteAccessToken();
    if (!access_token) return setState("login");
    setState("loading");
    const d = await checkout<{ from: number; urls: string[] }>({ action: "book_pages", book: b.id, from, count: 2, access_token });
    if (d.error === "login_required") return setState("login");
    if (d.error || !d.urls) return setState("error");
    setUrls((u) => {
      const next: Record<number, string> = {};
      d.urls.forEach((url, i) => (next[d.from + i] = url));
      return { ...u, ...next };
    });
    setState("idle");
  }, []);

  function open(b: Book, p?: number) {
    let start = p && p >= 1 && p <= b.pages ? p : 1;
    if (!p) {
      try {
        start = Math.min(b.pages, Math.max(1, parseInt(localStorage.getItem(LAST_KEY(b.id)) || "1", 10) || 1));
      } catch {
        /* ignore */
      }
    }
    setBook(b);
    setUrls({});
    setPage(start);
  }

  useEffect(() => {
    if (!book) return;
    try {
      localStorage.setItem(LAST_KEY(book.id), String(page));
      history.replaceState(null, "", `?book=${book.id}&p=${page}`);
    } catch {
      /* ignore */
    }
    // links expire after 3 minutes, so fetch fresh ones for the page being opened
    load(book, page);
    window.scrollTo({ top: 0 });
  }, [book, page, load]);

  const go = useCallback((n: number) => book && setPage((p) => Math.min(book.pages, Math.max(1, p + n))), [book]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) e.preventDefault();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);

  const loginHref = () => `/login.html?next=${encodeURIComponent(typeof location !== "undefined" ? location.pathname + location.search : "/examhelp/current-affairs/books/")}`;

  if (!book)
    return (
      <div className="container-page py-8 sm:py-12">
        <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">{t("पत्रिकाएँ — ऑनलाइन पढ़ें", "Magazines — read online")}</h1>
        <p className="mt-2 text-ink-600">{t("लॉगिन करके सभी पत्रिकाएँ मुफ़्त पढ़ें। पेज आगे-पीछे करें; डाउनलोड की सुविधा नहीं है।", "Log in to read every magazine free. Turn pages back and forth; downloading is not available.")}</p>
        {!books ? (
          <p className="mt-8 text-ink-500">{t("लोड हो रहा है…", "Loading…")}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((b) => (
              <button key={b.id} type="button" onClick={() => open(b)} className="card flex items-start gap-3 p-5 text-left transition hover:shadow-lg">
                <BookOpen className="mt-1 h-8 w-8 shrink-0 text-brand-700" aria-hidden="true" />
                <span>
                  <span className="block font-bold text-ink-900">{lang === "hi" ? b.hi : b.en}</span>
                  <span className="mt-1 block text-sm text-ink-500">{b.pages} {t("पेज · पढ़ना शुरू करें →", "pages · start reading →")}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );

  const url = urls[page];
  return (
    <div className="container-page py-4 sm:py-6 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => { setBook(null); history.replaceState(null, "", location.pathname); }} className="text-sm font-semibold text-brand-700">
          ← {t("सभी पत्रिकाएँ", "All magazines")}
        </button>
        <h1 className="text-base font-bold text-ink-900 sm:text-lg">{lang === "hi" ? book.hi : book.en}</h1>
      </div>

      {state === "login" ? (
        <div className="card mx-auto mt-8 max-w-md p-6 text-center">
          <p className="text-ink-700">{t("यह पत्रिका पढ़ने के लिए लॉगिन करें (मुफ़्त)।", "Please log in to read this magazine (free).")}</p>
          <a href={loginHref()} className="btn-primary mt-4 inline-flex"><LogIn className="h-4 w-4" aria-hidden="true" /> {t("लॉगिन / रजिस्टर", "Login / Register")}</a>
        </div>
      ) : (
        <>
          <Controls page={page} pages={book.pages} go={go} setPage={setPage} t={t} />
          <div
            className="relative mx-auto mt-3 w-full max-w-3xl overflow-hidden rounded-lg border border-ink-200 bg-white shadow"
            style={{ aspectRatio: "210 / 297" }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={`${t("पेज", "Page")} ${page}`} draggable={false} className="pointer-events-none h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-500">
                {state === "error" ? t("पेज लोड नहीं हुआ। फिर से कोशिश करें।", "Page did not load. Please try again.") : t("पेज लोड हो रहा है…", "Loading page…")}
              </div>
            )}
            {/* transparent cover: blocks long-press / drag saving of the image */}
            <div className="absolute inset-0" aria-hidden="true" />
            {who ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-around opacity-[0.07]" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="-rotate-30 whitespace-nowrap text-xl font-bold text-ink-900 sm:text-3xl">tettesthub.in · {who}</span>
                ))}
              </div>
            ) : null}
          </div>
          <Controls page={page} pages={book.pages} go={go} setPage={setPage} t={t} />
        </>
      )}
    </div>
  );
}

function Controls({ page, pages, go, setPage, t }: { page: number; pages: number; go: (n: number) => void; setPage: (n: number) => void; t: (hi: string, en: string) => string }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-3">
      <button type="button" onClick={() => go(-1)} disabled={page <= 1} className="btn-primary disabled:opacity-40" aria-label={t("पिछला पेज", "Previous page")}>
        <ChevronLeft className="h-5 w-5" aria-hidden="true" /> {t("पिछला", "Prev")}
      </button>
      <label className="flex items-center gap-1 text-sm text-ink-700">
        <input
          type="number"
          min={1}
          max={pages}
          value={page}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (n >= 1 && n <= pages) setPage(n);
          }}
          className="w-16 rounded-md border border-ink-300 px-2 py-1 text-center"
          aria-label={t("पेज नंबर", "Page number")}
        />
        / {pages}
      </label>
      <button type="button" onClick={() => go(1)} disabled={page >= pages} className="btn-primary disabled:opacity-40" aria-label={t("अगला पेज", "Next page")}>
        {t("अगला", "Next")} <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
