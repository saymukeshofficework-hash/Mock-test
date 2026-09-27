import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { business, product } from '../config'
import { useLang } from '../i18n'
import { hasWhatsApp, supportUrl } from '../lib/whatsapp'

// Shows the language you can switch TO, in that language's own script.
export function LangToggle() {
  const { lang, toggle, t } = useLang()
  return (
    <button type="button" onClick={toggle} aria-label={t.toggleLabel} title={t.toggleLabel}
      className="inline-flex h-9 items-center rounded-full border border-paper-300 bg-paper-50 p-0.5 text-sm font-semibold">
      <span className={`rounded-full px-2.5 py-1 ${lang === 'hi' ? 'bg-ink-900 text-paper-50' : 'text-ink-500'}`} lang="hi">हिंदी</span>
      <span className={`rounded-full px-2.5 py-1 ${lang === 'en' ? 'bg-ink-900 text-paper-50' : 'text-ink-500'}`} lang="en">EN</span>
    </button>
  )
}

export function Header() {
  const { t } = useLang()
  return (
    <header className="sticky top-0 z-30 border-b border-paper-200/80 bg-paper-100/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" aria-label={product.shortName} className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-sm font-bold text-paper-50">BC</span>
          <span className="hidden whitespace-nowrap sm:inline">{product.shortName}</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link to="/check-status" className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-ink-700 hover:bg-paper-200 sm:px-3">
            {t.header.alreadyPaid}
          </Link>
          <LangToggle />
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t border-paper-200 bg-paper-100 pb-28 pt-10 text-sm text-ink-500 sm:pb-10">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-serif text-base font-semibold text-ink-900">{product.name}</p>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
          <Link to="/terms" className="hover:text-ink-900">{t.footer.terms}</Link>
          <Link to="/privacy" className="hover:text-ink-900">{t.footer.privacy}</Link>
          <Link to="/refund" className="hover:text-ink-900">{t.footer.refund}</Link>
          <Link to="/contact" className="hover:text-ink-900">{t.footer.contact}</Link>
          <Link to="/check-status" className="hover:text-ink-900">{t.footer.checkStatus}</Link>
          {hasWhatsApp && <a href={supportUrl()} target="_blank" rel="noopener" className="hover:text-ink-900">{t.footer.whatsapp}</a>}
        </nav>
        <p className="mt-6 text-xs">{t.footer.secured} © {new Date().getFullYear()} {business.sellerName.startsWith('[') ? product.author : business.sellerName}.</p>
      </div>
    </footer>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </>
  )
}

// Legal pages stay in English (one exact wording); Hindi readers get a short note.
export function Prose({ title, children }: { title: string; children: ReactNode }) {
  const { lang } = useLang()
  return (
    <Page>
      <article lang="en" className="prose-bc mx-auto max-w-2xl px-4 py-10 sm:py-14">
        {lang === 'hi' && (
          <p lang="hi" className="mb-6 rounded-xl bg-paper-200/70 px-4 py-3 text-sm text-ink-700">
            यह पेज केवल अंग्रेज़ी में उपलब्ध है, ताकि इसकी शर्तें एक ही सटीक भाषा में रहें।
          </p>
        )}
        <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{title}</h1>
        {children}
      </article>
    </Page>
  )
}
