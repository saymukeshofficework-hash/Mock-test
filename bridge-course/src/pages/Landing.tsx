import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BuyDialog from '../components/BuyDialog'
import { Page } from '../components/Layout'
import WhatsAppButton, { WhatsAppIcon } from '../components/WhatsAppButton'
import { papers, product, samples } from '../config'
import { useLang } from '../i18n'
import { track } from '../lib/analytics'
import { asset } from '../lib/base'
import { hasWhatsApp, shareUrl } from '../lib/whatsapp'
import { faqs } from './faq'

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-none text-leaf-500" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  )
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">{kicker}</p>
      <h2 className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{title}</h2>
    </div>
  )
}

export default function Landing() {
  const { t, lang } = useLang()
  const [buyOpen, setBuyOpen] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)
  const [showBar, setShowBar] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    track('landing_page_view')
  }, [])

  // The sticky mobile bar appears only once the hero's own Buy button is off-screen.
  useEffect(() => {
    const el = heroRef.current
    if (!el || !('IntersectionObserver' in window)) return setShowBar(true)
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function buy() {
    track('buy_button_click')
    setBuyOpen(true)
  }

  return (
    <Page>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden bg-ink-900 text-paper-50">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 34px)' }} />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-4 pb-14 pt-10 sm:pb-20 sm:pt-16 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <span lang="en" className="inline-block rounded-full border border-saffron-400/50 bg-saffron-500/10 px-3 py-1 text-xs font-bold tracking-[0.2em] text-saffron-400">
              {product.badge}
            </span>
            <h1 className="mt-5 font-serif text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl">
              {product.shortName}
              <span className={`mt-2 block text-[1.35rem] font-normal text-paper-200 sm:text-3xl ${lang === 'en' ? 'italic' : ''}`}>{t.hero.by}</span>
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-300">{t.hero.tagline}</p>

            <div className="mt-7 flex items-end gap-3">
              <span className="font-serif text-5xl font-bold text-paper-50">{product.priceDisplay}</span>
              <span className="pb-2 text-sm text-ink-300">{t.hero.oneTime}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={buy} className="btn-primary sm:px-8">{t.hero.buy}</button>
              <a href="#samples" className="btn-ghost-dark">{t.hero.samples}</a>
            </div>
            <p className="mt-5 text-[13px] text-ink-300">
              {t.hero.trust.map((x, i) => (
                <span key={x}>{i > 0 && <span className="px-1 text-saffron-400">•</span>}{x}</span>
              ))}
            </p>
          </div>

          {/* Stacked-sheets visual using real sample pages */}
          <div className="relative mx-auto h-[300px] w-full max-w-[340px] sm:h-[380px]" aria-hidden>
            <img src={asset(samples[2].src)} alt="" width={600} height={780} loading="eager"
              className="absolute left-0 top-8 w-[58%] -rotate-[8deg] rounded-md shadow-2xl ring-1 ring-black/10" />
            <img src={asset(samples[1].src)} alt="" width={600} height={780} loading="eager"
              className="absolute right-0 top-4 w-[58%] rotate-[8deg] rounded-md shadow-2xl ring-1 ring-black/10" />
            <img src={asset(samples[0].src)} alt="" width={600} height={780} fetchPriority="high"
              className="absolute left-1/2 top-10 w-[66%] -translate-x-1/2 rounded-md shadow-2xl ring-1 ring-black/10" />
            <div className="absolute -bottom-2 left-1/2 w-max -translate-x-1/2 rounded-full bg-paper-50 px-4 py-1.5 text-xs font-semibold text-ink-900 shadow-lg">
              {t.hero.stack}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <SectionTitle kicker={t.get.kicker} title={t.get.title} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.get.items.map((f) => (
            <div key={f.title} className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <h3 className="font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{f.body}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-serif text-2xl font-semibold text-ink-900">{t.get.papersTitle}</h3>
        <div className="mt-4 divide-y divide-paper-200 overflow-hidden rounded-2xl border border-paper-200 bg-paper-50">
          {papers.map((p) => (
            <details key={p.title} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 sm:px-5">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-ink-900 text-sm font-bold text-paper-50">
                  {p.chapters.length}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-ink-900">
                    {p.number ? t.get.paper(p.number) : ''}{lang === 'hi' && p.titleHi ? p.titleHi : p.title}
                  </span>
                  <span className="block text-sm text-ink-500">
                    {lang === 'hi' ? (p.titleHi ? `${p.title} · ` : '') : (p.titleHi ? `${p.titleHi} · ` : '')}{t.get.language[p.language]}
                  </span>
                </span>
                <svg viewBox="0 0 20 20" className="h-5 w-5 flex-none text-ink-500 transition group-open:rotate-180" fill="currentColor" aria-hidden>
                  <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                </svg>
              </summary>
              <ol className="list-decimal space-y-1.5 px-5 pb-5 pl-[3.75rem] text-[15px] text-ink-700 sm:pl-[4.25rem]">
                {p.chapters.map((c) => <li key={c}>{c}</li>)}
              </ol>
            </details>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="bg-paper-200/60">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <SectionTitle kicker={t.why.kicker} title={t.why.title} />
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.why.items.map((w) => (
              <li key={w} className="flex gap-3 rounded-2xl bg-paper-50 p-4 text-[15px] leading-relaxed text-ink-800">
                <Check /> {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SAMPLES */}
      <section id="samples" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-14 sm:py-20">
        <SectionTitle kicker={t.samples.kicker} title={t.samples.title} />
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {samples.map((s, i) => (
            <button key={s.src} onClick={() => setZoom(i)}
              className="relative w-[78%] flex-none snap-center overflow-hidden rounded-xl bg-white shadow-sheet ring-1 ring-paper-300 sm:w-auto">
              <img src={asset(s.src)} alt={t.samples.alts[i]} width={600} height={780} loading="lazy" className="block w-full" />
              <span className="absolute bottom-2 right-2 rounded-md bg-ink-900/80 px-2 py-1 text-[11px] font-semibold text-paper-50">{t.samples.tap}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-500">{t.samples.note}</p>
      </section>

      {zoom !== null && (
        <div role="dialog" aria-modal="true" aria-label={t.samples.alts[zoom]}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-3" onClick={() => setZoom(null)}>
          <img src={asset(samples[zoom].src)} alt={t.samples.alts[zoom]} className="max-h-full max-w-full rounded-lg" />
          <button className="absolute right-3 top-3 rounded-full bg-paper-50 px-4 py-2 text-sm font-semibold text-ink-900">{t.samples.close}</button>
        </div>
      )}

      {/* RECEIVE + PRICE */}
      <section className="bg-ink-900 text-paper-50">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-400">{t.receive.kicker}</p>
            <ul className="mt-5 space-y-3 text-lg">
              {t.receive.items.map((r) => (
                <li key={r} className="flex gap-3"><span className="text-leaf-500">✓</span>{r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-paper-50 p-6 text-ink-900 shadow-2xl sm:p-8">
            <p className="text-sm font-semibold text-ink-500">{product.name}</p>
            <p className="mt-2 font-serif text-6xl font-bold">{product.priceDisplay}</p>
            <p className="mt-1 text-sm text-ink-500">{t.receive.card}</p>
            <button onClick={buy} className="btn-primary mt-6 w-full">{t.receive.cta}</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <SectionTitle kicker={t.how.kicker} title={t.how.title} />
        <ol className="grid gap-4 sm:grid-cols-4">
          {t.how.steps.map((step, i) => (
            <li key={step} className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <span className="font-serif text-3xl font-bold text-saffron-500">{i + 1}</span>
              <p className="mt-2 font-medium text-ink-900">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-paper-200/60">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
          <SectionTitle kicker={t.faq.kicker} title={t.faq.title} />
          <div className="divide-y divide-paper-300 rounded-2xl bg-paper-50">
            {faqs[lang].map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                  {f.q}
                  <span className="text-xl text-ink-500 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <div className="mt-2 text-[15px] leading-relaxed text-ink-700">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT + SHARE */}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:grid-cols-2">
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">{t.help.title}</h2>
          <p className="mt-1 text-ink-700">{t.help.body}</p>
          <div className="mt-4"><WhatsAppButton /></div>
        </div>
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">{t.help.shareTitle}</h2>
          <p className="mt-1 text-ink-700">{t.help.shareBody}</p>
          <a href={shareUrl()} target="_blank" rel="noopener" className="btn-whatsapp mt-4">
            <WhatsAppIcon /> {t.help.share}
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl bg-saffron-500 px-6 py-10 text-center text-ink-950 sm:py-14">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{product.name}</h2>
          <p className="mt-2 font-serif text-5xl font-bold">{product.priceDisplay}</p>
          <button onClick={buy} className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-ink-900 px-8 text-base font-bold tracking-wide text-paper-50 shadow-lg transition hover:bg-ink-800 sm:w-auto">
            {t.final.cta}
          </button>
          <p className="mt-4 text-sm">
            {t.final.paid} <Link to="/check-status" className="font-semibold underline">{t.final.check}</Link>
          </p>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-paper-300 bg-paper-50/95 px-4 py-3 backdrop-blur transition-transform duration-300 sm:hidden ${showBar ? 'translate-y-0' : 'translate-y-full'}`}
        aria-hidden={!showBar}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="font-serif text-2xl font-bold text-ink-900">{product.priceDisplay}</p>
            <p className="text-[11px] text-ink-500">{t.bar.sub}</p>
          </div>
          <button onClick={buy} className="btn-primary flex-1">{t.bar.buy}</button>
          {hasWhatsApp && (
            <a href={shareUrl()} target="_blank" rel="noopener" aria-label={t.bar.share}
              className="grid h-[52px] w-[52px] flex-none place-items-center rounded-2xl bg-[#25D366] text-white">
              <WhatsAppIcon className="h-6 w-6" />
            </a>
          )}
        </div>
      </div>

      <BuyDialog open={buyOpen} onClose={() => setBuyOpen(false)} />
    </Page>
  )
}
