import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { business, product } from '../config'
import { hasWhatsApp, supportUrl } from '../lib/whatsapp'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-paper-200/80 bg-paper-100/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-sm font-bold text-paper-50">BC</span>
          <span className="hidden min-[380px]:inline">{product.shortName}</span>
        </Link>
        <Link to="/check-status" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-paper-200">
          Already paid?
        </Link>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-paper-200 bg-paper-100 pb-28 pt-10 text-sm text-ink-500 sm:pb-10">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-serif text-base font-semibold text-ink-900">{product.name}</p>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
          <Link to="/terms" className="hover:text-ink-900">Terms</Link>
          <Link to="/privacy" className="hover:text-ink-900">Privacy</Link>
          <Link to="/refund" className="hover:text-ink-900">Refund policy</Link>
          <Link to="/contact" className="hover:text-ink-900">Contact</Link>
          <Link to="/check-status" className="hover:text-ink-900">Check payment status</Link>
          {hasWhatsApp && <a href={supportUrl()} target="_blank" rel="noopener" className="hover:text-ink-900">WhatsApp support</a>}
        </nav>
        <p className="mt-6 text-xs">Payments secured by Razorpay. © {new Date().getFullYear()} {business.sellerName.startsWith('[') ? product.author : business.sellerName}.</p>
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

export function Prose({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Page>
      <article className="prose-bc mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">{title}</h1>
        {children}
      </article>
    </Page>
  )
}
