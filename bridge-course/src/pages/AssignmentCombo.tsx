// Landing page for the ₹49 Assignment Combo: 7 assignment covers (Course 1–7) + a blank
// 12-page Teaching Plan (शिक्षण योजना), one 19-page A4 PDF. Describes only what is in the PDF.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BuyDialog from '../components/BuyDialog'
import { Page } from '../components/Layout'
import WhatsAppButton from '../components/WhatsAppButton'
import { assignmentCombo, product } from '../config'
import { useLang, type Lang } from '../i18n'
import { track } from '../lib/analytics'
import { asset } from '../lib/base'

const P = assignmentCombo.priceDisplay

const copy: Record<Lang, {
  kicker: string; title: string; sub: string; tagline: string; buy: string; oneTime: string; trust: string[]
  coversTitle: string; coversBody: string; course: (n: number) => string
  insideTitle: string; inside: { title: string; body: string }[]
  howTitle: string; how: string[]
  previewTitle: string; previewNote: string; alts: string[]; tap: string; close: string
  faqTitle: string; faqs: { q: string; a: string }[]
  notesTitle: string; notesBody: string; notesCta: string
  helpTitle: string; helpBody: string; finalCta: string; docTitle: string; subtitle: string; disclaimer: string
}> = {
  hi: {
    kicker: 'ब्रिज कोर्स · असाइनमेंट कॉम्बो',
    title: 'असाइनमेंट कॉम्बो',
    sub: '7 कवर + शिक्षण योजना — एक PDF',
    tagline: 'सभी 7 कोर्स के रंगीन असाइनमेंट कवर और 12 पेज की खाली शिक्षण योजना — एक ही PDF में। डाउनलोड करें, A4 पर प्रिंट करें और असाइनमेंट तैयार।',
    buy: `अभी खरीदें — ${P}`,
    oneTime: 'एक बार का भुगतान · PDF',
    trust: ['19 पेज, A4', 'तुरंत डाउनलोड', 'सुरक्षित Razorpay भुगतान'],
    coversTitle: '7 असाइनमेंट कवर — हर कोर्स का अलग',
    coversBody: 'हर कवर पर “NIOS B.Ed Bridge Course · असाइनमेंट”, कोर्स नंबर और पाठ्यक्रम का नाम छपा है। रंगीन प्रिंट में सबसे अच्छे लगते हैं।',
    course: (n) => `कोर्स ${n}`,
    insideTitle: 'शिक्षण योजना (12 पेज) में क्या है',
    inside: [
      { title: 'पहला पेज — पूरी जानकारी', body: 'दिनांक, कक्षा, विषय, पाठ, कालांश और अवधि के खाने; लर्निंग आउटकम, प्रकरण और शिक्षण-सिखाने की सामग्री लिखने की जगह।' },
      { title: 'सीखने-सिखाने की प्रक्रियाएँ', body: 'हर पेज पर तालिका: क्र.सं., चरण, समय और आकलन के तरीके — लाइनों के साथ, ताकि लिखना आसान रहे।' },
      { title: '10 पेज चरणों के लिए', body: 'बीच के 10 पेज सिर्फ़ चरण-तालिका, ताकि पूरी गतिविधि विस्तार से लिख सकें।' },
      { title: 'अंतिम पेज', body: 'प्रदत्त गृहकार्य (Home Assignment) और शिक्षक की आगामी योजना / टिप्पणी (Teacher’s Remarks) के लिए अलग खाने।' },
    ],
    howTitle: 'कैसे इस्तेमाल करें',
    how: [`${P} का भुगतान करें`, 'PDF डाउनलोड करके फ़ोन में सेव करें', 'कवर रंगीन में और शिक्षण योजना A4 पर प्रिंट कराएँ', 'शिक्षण योजना हाथ से भरें और हर असाइनमेंट पर उसका कवर लगाएँ'],
    previewTitle: 'पेज देखें',
    previewNote: 'प्रीव्यू कम क्वालिटी में और “SAMPLE · PREVIEW” के साथ है। खरीदने पर साफ़, बिना वॉटरमार्क वाली PDF मिलती है।',
    alts: ['कवर — कोर्स 1: बाल विकास एवं शैक्षिक मनोविज्ञान', 'कवर — कोर्स 6: हमारे आस-पास की दुनिया का शिक्षाशास्त्र', 'शिक्षण योजना — पहला पेज', 'शिक्षण योजना — अंतिम पेज'],
    tap: 'बड़ा देखें',
    close: 'बंद करें',
    faqTitle: 'सवाल-जवाब',
    faqs: [
      { q: 'इस PDF में क्या-क्या है?', a: 'पहले 7 पेज: कोर्स 1 से 7 तक के असाइनमेंट कवर। उसके बाद 12 पेज: खाली शिक्षण योजना। कुल 19 पेज, A4 साइज़।' },
      { q: 'क्या शिक्षण योजना भरी हुई है?', a: 'नहीं। यह खाली कॉपी (टेम्पलेट) है — इसे प्रिंट करके आप खुद भरते हैं।' },
      { q: 'क्या छपी हुई कॉपी घर आएगी?', a: 'नहीं। यह केवल डिजिटल PDF है, जिसे आप खुद प्रिंट करते हैं।' },
      { q: 'कितनी बार प्रिंट कर सकता/सकती हूँ?', a: 'अपने असाइनमेंट के लिए जितनी बार चाहें। PDF आगे बेचना या ग्रुप में शेयर करना मना है।' },
      { q: 'डाउनलोड कितनी बार होगा?', a: `भुगतान के बाद ${product.maxDownloads} बार डाउनलोड कर सकते हैं। PDF खुलते ही फ़ोन में सेव कर लें।` },
    ],
    notesTitle: 'ब्रिज कोर्स के नोट्स भी चाहिए?',
    notesBody: '6 पेपर, 40 अध्यायों के नोट्स — पाठगत और पाठांत प्रश्नों के उत्तर सहित, एक PDF में।',
    notesCta: `नोट्स देखें — ${product.priceDisplay}`,
    helpTitle: 'मदद चाहिए?',
    helpBody: 'खरीदने से पहले कोई सवाल हो या भुगतान के बाद कोई समस्या — हमें मैसेज करें।',
    finalCta: `असाइनमेंट कॉम्बो पाएँ — ${P}`,
    docTitle: `असाइनमेंट कॉम्बो — 7 कवर + शिक्षण योजना PDF | ${P}`,
    subtitle: 'प्रिंट करने योग्य PDF · 19 पेज',
    disclaimer: 'यह NIOS का आधिकारिक प्रकाशन नहीं है। कवर पर संस्थान और कोर्स का नाम केवल आपके असाइनमेंट की पहचान के लिए है।',
  },
  en: {
    kicker: 'Bridge Course · Assignment combo',
    title: 'Assignment Combo',
    sub: '7 covers + Teaching Plan — one PDF',
    tagline: 'Colour assignment covers for all 7 courses and a 12-page blank Teaching Plan (शिक्षण योजना) in one PDF. Download, print on A4 and your assignment is ready.',
    buy: `BUY NOW — ${P}`,
    oneTime: 'one-time · PDF',
    trust: ['19 pages, A4', 'Instant download', 'Secure Razorpay payment'],
    coversTitle: '7 assignment covers — one per course',
    coversBody: 'Each cover reads “NIOS B.Ed Bridge Course · असाइनमेंट” with the course number and course name. They look best printed in colour.',
    course: (n) => `Course ${n}`,
    insideTitle: 'What’s in the Teaching Plan (12 pages)',
    inside: [
      { title: 'Page 1 — all the details', body: 'Boxes for date, class, subject, chapter, period and time; space for learning outcomes, topic and required materials.' },
      { title: 'Teaching-learning process', body: 'A table on every page — S.N., steps, expected time and methods of assessment — with ruled lines for easy writing.' },
      { title: '10 pages for steps', body: 'The middle 10 pages are the steps table only, so you can write the whole activity in detail.' },
      { title: 'Last page', body: 'Separate sections for the home assignment and the teacher’s next plan / remarks.' },
    ],
    howTitle: 'How to use it',
    how: [`Pay ${P}`, 'Download the PDF and save it on your phone', 'Print the covers in colour and the Teaching Plan on A4', 'Fill in the Teaching Plan by hand and put a cover on each assignment'],
    previewTitle: 'See the pages',
    previewNote: 'Previews are low-quality and marked “SAMPLE · PREVIEW”. The PDF you buy is clean, without watermarks.',
    alts: ['Cover — Course 1: Child Development and Educational Psychology', 'Cover — Course 6: Pedagogy of The World Around Us', 'Teaching Plan — first page', 'Teaching Plan — last page'],
    tap: 'Enlarge',
    close: 'Close',
    faqTitle: 'FAQ',
    faqs: [
      { q: 'What is in the PDF?', a: 'First 7 pages: assignment covers for Course 1 to 7. Then 12 pages: a blank Teaching Plan. 19 A4 pages in total.' },
      { q: 'Is the Teaching Plan filled in?', a: 'No. It is a blank copy (template) — you print it and fill it in yourself.' },
      { q: 'Will a printed copy be delivered?', a: 'No. It is a digital PDF only; you print it yourself.' },
      { q: 'How many times can I print it?', a: 'As many times as you need for your own assignments. Reselling or sharing the PDF in groups is not allowed.' },
      { q: 'How many downloads do I get?', a: `You can download it ${product.maxDownloads} times after paying. Save the PDF on your phone as soon as it opens.` },
    ],
    notesTitle: 'Need the Bridge Course notes too?',
    notesBody: 'Notes for 6 papers and 40 chapters, with answers to in-text and end-of-unit questions, in one PDF.',
    notesCta: `See the notes — ${product.priceDisplay}`,
    helpTitle: 'Need help?',
    helpBody: 'Questions before buying, or a problem after paying — message us.',
    finalCta: `GET THE ASSIGNMENT COMBO — ${P}`,
    docTitle: `Assignment Combo — 7 Covers + Teaching Plan PDF | ${P}`,
    subtitle: 'Printable PDF · 19 pages',
    disclaimer: 'This is not an official NIOS publication. The institution and course names on the covers are only there to label your assignments.',
  },
}

const previews = ['previews/cv-1.webp', 'previews/cv-6.webp', 'previews/tp-1.webp', 'previews/tp-12.webp']

export default function AssignmentCombo() {
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
            <img src={asset(previews[2])} alt="" width={600} height={849}
              className="absolute right-0 top-6 w-[62%] rotate-[7deg] rounded-md shadow-2xl ring-1 ring-black/10" />
            <img src={asset(previews[0])} alt="" width={600} height={849} fetchPriority="high"
              className="absolute left-2 top-2 w-[70%] -rotate-[4deg] rounded-md shadow-2xl ring-1 ring-black/10" />
          </div>
        </div>
      </section>

      {/* COVERS */}
      <section className="mx-auto max-w-5xl px-4 pt-14 sm:pt-20">
        <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-ink-900 sm:text-4xl">{c.coversTitle}</h2>
        <p className="mt-3 max-w-2xl text-ink-700">{c.coversBody}</p>
        <ol className="mt-6 grid gap-2 sm:grid-cols-2">
          {assignmentCombo.courses.map((name, i) => (
            <li key={name} className="flex items-center gap-3 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3">
              <span className="flex-none rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-bold text-paper-50">{c.course(i + 1)}</span>
              <span className="text-[15px] text-ink-800">{name}</span>
            </li>
          ))}
        </ol>
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
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {previews.map((src, i) => (
              <button key={src} onClick={() => setZoom(i)}
                className="relative overflow-hidden rounded-xl bg-white shadow-sheet ring-1 ring-paper-300">
                <img src={asset(src)} alt={c.alts[i]} width={600} height={849} loading="lazy" className="block w-full" />
                <span className="absolute bottom-2 right-2 rounded-md bg-ink-900/80 px-2 py-1 text-[11px] font-semibold text-paper-50">{c.tap}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-500">{c.previewNote}</p>
          <p className="mt-2 text-sm text-ink-500">{c.disclaimer}</p>
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
          <div className="mt-4"><WhatsAppButton message={`Hello, I need help with ${assignmentCombo.name}.`} /></div>
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

      <BuyDialog open={buyOpen} onClose={() => setBuyOpen(false)} item={assignmentCombo} subtitle={c.subtitle} />
    </Page>
  )
}
