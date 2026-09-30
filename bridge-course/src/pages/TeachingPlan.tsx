// Landing page for the ₹29 printable Teaching Plan (शिक्षण योजना) assignment copy.
// Describes only what is actually in the PDF: a blank 12-page A4 template.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BuyDialog from '../components/BuyDialog'
import { Page } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { product, teachingPlan } from '../config'
import { useLang, type Lang } from '../i18n'
import { track } from '../lib/analytics'
import { asset } from '../lib/base'

const P = teachingPlan.priceDisplay

const copy: Record<Lang, {
  kicker: string; title: string; sub: string; tagline: string; buy: string; oneTime: string; trust: string[]
  insideTitle: string; inside: { title: string; body: string }[]
  howTitle: string; how: string[]
  previewTitle: string; previewNote: string; alts: string[]; tap: string; close: string
  faqTitle: string; faqs: { q: string; a: string }[]
  notesTitle: string; notesBody: string; notesCta: string
  helpTitle: string; helpBody: string; finalCta: string; docTitle: string; subtitle: string
}> = {
  hi: {
    kicker: 'ब्रिज कोर्स · असाइनमेंट कॉपी',
    title: 'शिक्षण योजना',
    sub: 'Teaching Plan — प्रिंट करने योग्य कॉपी',
    tagline: 'असाइनमेंट के लिए तैयार खाली शिक्षण योजना। डाउनलोड करें, A4 पर प्रिंट करें और हाथ से भरें।',
    buy: `अभी खरीदें — ${P}`,
    oneTime: 'एक बार का भुगतान · PDF',
    trust: ['12 पेज, A4', 'तुरंत डाउनलोड', 'सुरक्षित Razorpay भुगतान'],
    insideTitle: 'इस कॉपी में क्या है',
    inside: [
      { title: 'पहला पेज — पूरी जानकारी', body: 'दिनांक, कक्षा, विषय, पाठ, कालांश और अवधि के खाने; लर्निंग आउटकम, प्रकरण और शिक्षण-सिखाने की सामग्री लिखने की जगह।' },
      { title: 'सीखने-सिखाने की प्रक्रियाएँ', body: 'हर पेज पर तालिका: क्र.सं., चरण, समय और आकलन के तरीके — लाइनों के साथ, ताकि लिखना आसान रहे।' },
      { title: '10 पेज चरणों के लिए', body: 'पेज 2 से 11 तक सिर्फ़ चरण-तालिका, ताकि पूरी गतिविधि विस्तार से लिख सकें।' },
      { title: 'अंतिम पेज', body: 'प्रदत्त गृहकार्य (Home Assignment) और शिक्षक की आगामी योजना / टिप्पणी (Teacher’s Remarks) के लिए अलग खाने।' },
    ],
    howTitle: 'कैसे इस्तेमाल करें',
    how: [`${P} का भुगतान करें`, 'PDF डाउनलोड करके फ़ोन में सेव करें', 'दुकान या घर पर A4 पेपर पर प्रिंट कराएँ', 'हाथ से भरें और असाइनमेंट में लगाएँ'],
    previewTitle: 'पेज देखें',
    previewNote: 'प्रीव्यू कम क्वालिटी में और “SAMPLE · PREVIEW” के साथ है। खरीदने पर साफ़, बिना वॉटरमार्क वाली PDF मिलती है।',
    alts: ['पहला पेज — शिक्षण योजना का शीर्ष भाग, लर्निंग आउटकम और चरण-तालिका', 'अंतिम पेज — चरण-तालिका, प्रदत्त गृहकार्य और शिक्षक की आगामी योजना'],
    tap: 'बड़ा देखने के लिए टैप करें',
    close: 'बंद करें',
    faqTitle: 'सवाल-जवाब',
    faqs: [
      { q: 'क्या यह भरी हुई शिक्षण योजना है?', a: 'नहीं। यह खाली कॉपी (टेम्पलेट) है — इसे प्रिंट करके आप खुद भरते हैं।' },
      { q: 'क्या कोई छपी हुई कॉपी घर आएगी?', a: 'नहीं। यह केवल डिजिटल PDF है, जिसे आप खुद प्रिंट करते हैं।' },
      { q: 'कितनी बार प्रिंट कर सकता/सकती हूँ?', a: 'अपने असाइनमेंट के लिए जितनी बार चाहें। PDF आगे बेचना या ग्रुप में शेयर करना मना है।' },
      { q: 'डाउनलोड कितनी बार होगा?', a: `भुगतान के बाद ${product.maxDownloads} बार डाउनलोड कर सकते हैं। PDF खुलते ही फ़ोन में सेव कर लें।` },
    ],
    notesTitle: 'ब्रिज कोर्स के नोट्स भी चाहिए?',
    notesBody: '6 पेपर, 40 अध्यायों के नोट्स — पाठगत और पाठांत प्रश्नों के उत्तर सहित, एक PDF में।',
    notesCta: `नोट्स देखें — ${product.priceDisplay}`,
    helpTitle: 'मदद चाहिए?',
    helpBody: 'खरीदने से पहले कोई सवाल हो या भुगतान के बाद कोई समस्या — हमें मैसेज करें।',
    finalCta: `शिक्षण योजना कॉपी पाएँ — ${P}`,
    docTitle: `शिक्षण योजना असाइनमेंट कॉपी (Teaching Plan) PDF | ${P}`,
    subtitle: 'प्रिंट करने योग्य PDF · 12 पेज',
  },
  en: {
    kicker: 'Bridge Course · Assignment copy',
    title: 'Teaching Plan',
    sub: 'शिक्षण योजना — printable copy',
    tagline: 'A blank Teaching Plan ready for your assignment. Download it, print it on A4 and fill it in by hand.',
    buy: `BUY NOW — ${P}`,
    oneTime: 'one-time · PDF',
    trust: ['12 pages, A4', 'Instant download', 'Secure Razorpay payment'],
    insideTitle: 'What’s in the copy',
    inside: [
      { title: 'Page 1 — all the details', body: 'Boxes for date, class, subject, chapter, period and time; space for learning outcomes, topic and required materials.' },
      { title: 'Teaching-learning process', body: 'A table on every page — S.N., steps, expected time and methods of assessment — with ruled lines for easy writing.' },
      { title: '10 pages for steps', body: 'Pages 2 to 11 are the steps table only, so you can write the whole activity in detail.' },
      { title: 'Last page', body: 'Separate sections for the home assignment and the teacher’s next plan / remarks.' },
    ],
    howTitle: 'How to use it',
    how: [`Pay ${P}`, 'Download the PDF and save it on your phone', 'Print it on A4 paper at home or a shop', 'Fill it in by hand and attach it to your assignment'],
    previewTitle: 'See the pages',
    previewNote: 'Previews are low-quality and marked “SAMPLE · PREVIEW”. The PDF you buy is clean, without watermarks.',
    alts: ['Page 1 — Teaching Plan header, learning outcomes and steps table', 'Last page — steps table, home assignment and teacher’s next plan'],
    tap: 'Tap to enlarge',
    close: 'Close',
    faqTitle: 'FAQ',
    faqs: [
      { q: 'Is this a filled-in teaching plan?', a: 'No. It is a blank copy (template) — you print it and fill it in yourself.' },
      { q: 'Will a printed copy be delivered?', a: 'No. It is a digital PDF only; you print it yourself.' },
      { q: 'How many times can I print it?', a: 'As many times as you need for your own assignments. Reselling or sharing the PDF in groups is not allowed.' },
      { q: 'How many downloads do I get?', a: `You can download it ${product.maxDownloads} times after paying. Save the PDF on your phone as soon as it opens.` },
    ],
    notesTitle: 'Need the Bridge Course notes too?',
    notesBody: 'Notes for 6 papers and 40 chapters, with answers to in-text and end-of-unit questions, in one PDF.',
    notesCta: `See the notes — ${product.priceDisplay}`,
    helpTitle: 'Need help?',
    helpBody: 'Questions before buying, or a problem after paying — message us.',
    finalCta: `GET THE TEACHING PLAN COPY — ${P}`,
    docTitle: `Teaching Plan (शिक्षण योजना) Assignment Copy PDF | ${P}`,
    subtitle: 'Printable PDF · 12 pages',
  },
}

const previews = ['previews/tp-1.webp', 'previews/tp-12.webp']

export default function TeachingPlan() {
  const { lang, t: tt } = useLang()
  const c = copy[lang]
  const [buyOpen, setBuyOpen] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)

  useEffect(() => { track('landing_page_view') }, [])
  useEffect(() => {
    const prev = document.title
    document.title = c.docTitle
    return () => { document.title = prev }
  }, [c.docTitle])

  function buy() {
    track('buy_button_click')
    setBuyOpen(true)
  }

  return (
    <Page>
      {/* HERO */}
      <section className="bg-ink-900 text-paper-50">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-14 pt-10 sm:pb-20 sm:pt-16 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <span className="inline-block rounded-full border border-saffron-400/50 bg-saffron-500/10 px-3 py-1 text-xs font-bold text-saffron-400">
              {c.kicker}
            </span>
            <h1 className="mt-5 font-serif text-[2.6rem] font-semibold leading-[1.1] sm:text-6xl">
              {c.title}
              <span className="mt-2 block text-[1.3rem] font-normal text-paper-200 sm:text-3xl">{c.sub}</span>
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-300">{c.tagline}</p>
            <div className="mt-7 flex items-end gap-3">
              <span className="font-serif text-5xl font-bold">{P}</span>
              <span className="pb-2 text-sm text-ink-300">{c.oneTime}</span>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={buy} className="btn-primary sm:px-8">{c.buy}</button>
              <a href="#pages" className="btn-ghost-dark">{c.previewTitle}</a>
            </div>
            <p className="mt-5 text-[13px] text-ink-300">
              {c.trust.map((x, i) => (
                <span key={x}>{i > 0 && <span className="px-1 text-saffron-400">•</span>}{x}</span>
              ))}
            </p>
          </div>
          <div className="relative mx-auto h-[300px] w-full max-w-[320px] sm:h-[380px]" aria-hidden>
            <img src={asset(previews[1])} alt="" width={600} height={849}
              className="absolute right-0 top-6 w-[62%] rotate-[7deg] rounded-md shadow-2xl ring-1 ring-black/10" />
            <img src={asset(previews[0])} alt="" width={600} height={849} fetchPriority="high"
              className="absolute left-2 top-2 w-[70%] -rotate-[4deg] rounded-md shadow-2xl ring-1 ring-black/10" />
          </div>
        </div>
      </section>

      {/* INSIDE */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{c.insideTitle}</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {c.inside.map((f) => (
            <div key={f.title} className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
              <h3 className="font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREVIEWS */}
      <section id="pages" className="scroll-mt-16 bg-paper-200/60">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{c.previewTitle}</h2>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:max-w-2xl">
            {previews.map((src, i) => (
              <button key={src} onClick={() => setZoom(i)}
                className="relative overflow-hidden rounded-xl bg-white shadow-sheet ring-1 ring-paper-300">
                <img src={asset(src)} alt={c.alts[i]} width={600} height={849} loading="lazy" className="block w-full" />
                <span className="absolute bottom-2 right-2 rounded-md bg-ink-900/80 px-2 py-1 text-[11px] font-semibold text-paper-50">{c.tap}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-500">{c.previewNote}</p>
        </div>
      </section>

      {zoom !== null && (
        <div role="dialog" aria-modal="true" aria-label={c.alts[zoom]}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-3" onClick={() => setZoom(null)}>
          <img src={asset(previews[zoom])} alt={c.alts[zoom]} className="max-h-full max-w-full rounded-lg" />
          <button className="absolute right-3 top-3 rounded-full bg-paper-50 px-4 py-2 text-sm font-semibold text-ink-900">{c.close}</button>
        </div>
      )}

      {/* HOW */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{c.howTitle}</h2>
        <ol className="mt-7 grid gap-4 sm:grid-cols-4">
          {c.how.map((step, i) => (
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
          <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{c.faqTitle}</h2>
          <div className="mt-7 divide-y divide-paper-300 rounded-2xl bg-paper-50">
            {c.faqs.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                  {f.q}
                  <span className="text-xl text-ink-500 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CROSS-SELL + HELP */}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:grid-cols-2">
        <div className="rounded-2xl border border-saffron-400/40 bg-saffron-500/5 p-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">{c.notesTitle}</h2>
          <p className="mt-1 text-ink-700">{c.notesBody}</p>
          <Link to="/" className="btn-secondary mt-4">{c.notesCta}</Link>
        </div>
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">{c.helpTitle}</h2>
          <p className="mt-1 text-ink-700">{c.helpBody}</p>
          <div className="mt-4"><WhatsAppButton message={`Hello, I need help with ${teachingPlan.name}.`} /></div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl bg-saffron-500 px-6 py-10 text-center text-ink-950 sm:py-14">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{c.title}</h2>
          <p className="mt-2 font-serif text-5xl font-bold">{P}</p>
          <button onClick={buy} className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-ink-900 px-8 text-base font-bold text-paper-50 shadow-lg transition hover:bg-ink-800 sm:w-auto">
            {c.finalCta}
          </button>
          <p className="mt-4 text-sm">
            {tt.final.paid} <Link to="/check-status" className="font-semibold underline">{tt.final.check}</Link>
          </p>
        </div>
      </section>

      <BuyDialog open={buyOpen} onClose={() => setBuyOpen(false)} item={teachingPlan} subtitle={c.subtitle} />
    </Page>
  )
}
