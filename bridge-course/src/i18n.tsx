// Hindi / English copy for every buyer-facing page. Hindi is the default; the choice is
// remembered per browser (a convenience only — nothing depends on it). Legal pages and
// /admin stay English on purpose: legal text should have one exact wording.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { product, totals } from './config'
import { ApiError } from './lib/api'

export type Lang = 'hi' | 'en'
const STORAGE_KEY = 'bc_lang_v1'
const P = product.priceDisplay
const MAX = product.maxDownloads
const MIN = product.linkExpiryMinutes

const en = {
  toggleLabel: 'हिंदी में पढ़ें',
  toggleShort: 'हिंदी',
  header: { alreadyPaid: 'Already paid?' },
  footer: {
    terms: 'Terms', privacy: 'Privacy', refund: 'Refund policy', contact: 'Contact',
    checkStatus: 'Check payment status', whatsapp: 'WhatsApp support', copy: 'Teaching Plan copy (₹29)',
    secured: 'Payments secured by Razorpay.',
  },
  hero: {
    by: `by ${product.author}`,
    tagline: product.tagline,
    oneTime: 'one-time · PDF',
    buy: `BUY NOW — ${P}`,
    samples: 'VIEW SAMPLE PAGES',
    trust: ['Instant Digital Access', 'Secure Razorpay Payment', 'PDF Notes'],
    stack: `${totals.papers} papers · ${totals.chapters} chapter notes`,
  },
  get: {
    kicker: 'What you get',
    title: `${totals.papers} papers, ${totals.chapters} chapter-wise notes`,
    items: [
      { title: 'In-text questions, answered', body: 'Every पाठगत प्रश्न / Check Your Progress question with the correct option marked ✔ and a short explanation of why.' },
      { title: 'End-of-unit answers', body: 'पाठांत प्रश्न / End Exercises written out as structured answers — points, examples and a conclusion.' },
      { title: 'Quick revision lists', body: 'A त्वरित सूची / Quick Revision List and one-glance answer key for each unit.' },
      { title: 'Tables & comparisons', body: 'Key ideas laid out in tables — e.g. EVS vs TWAU, disciplinary vs interdisciplinary, skill-wise summaries.' },
      { title: 'Practice MCQs', body: 'Extra practice MCQs with answers in many units, plus revision sheets, a glossary and a suggested-reading guide for Language-II.' },
      { title: 'Hindi + English', body: 'Five papers in Hindi and Pedagogy of Language-II in English, exactly as the course is taught.' },
    ],
    papersTitle: 'Papers & chapters inside',
    paper: (n: number) => `Paper ${n}: `,
    language: { Hindi: 'Hindi', English: 'English' } as Record<'Hindi' | 'English', string>,
  },
  why: {
    kicker: 'Why these notes',
    title: 'Written for revision, not for reading twice',
    items: [
      'Structured the same way in every unit: in-text questions → quick list → end-of-unit answers.',
      'Easy revision — short points and tables instead of long paragraphs.',
      'Important concepts organised clearly, with the policy references the course uses (NEP 2020, NCF-FS 2022, NCF-SE 2023).',
      'Exam-oriented: answers to the actual in-text and end-of-unit questions, not general theory.',
      'Digital PDF — read on your phone, anywhere, without carrying books.',
    ],
  },
  samples: {
    kicker: 'Sample pages',
    title: 'See the notes before you buy',
    tap: 'Tap to enlarge',
    close: 'Close',
    note: `Previews show only the first part of 3 of the ${totals.chapters} chapters, marked “SAMPLE / PREVIEW”.`,
    alts: [
      'Sample page — Paper 1, इकाई 1: बाल्यावस्था को समझना (in-text MCQs with explanations)',
      'Sample page — Paper 4, Unit 4: Word Recognition (Check Your Progress with model answers)',
      'Sample page — Paper 6, इकाई 1: TWAU का स्वरूप तथा क्षेत्र (key points and tables)',
    ],
  },
  receive: {
    kicker: 'What you receive',
    items: ['Complete digital PDF', 'Instant access after successful payment', 'Mobile-friendly reading', 'Downloadable for personal study', 'No physical delivery'],
    card: `One-time payment · Digital PDF · ${totals.chapters} chapter notes`,
    cta: `GET THE NOTES — ${P}`,
  },
  intro: {
    question: 'Preparing for the Bridge Course but not sure what to read, or where to find the material?',
    answer: 'That is exactly why these notes were made. Everything is in one place, in simple language and in the right order, so you spend your time studying instead of searching.',
    whoTitle: 'Who are these notes for?',
    who: [
      'Teachers and candidates doing the Bridge Course who want one organised set of material to study from.',
      'The notes live on your phone. Open them whenever you get time, and look back at them whenever you need to.',
    ],
    honestTitle: 'Should you buy them?',
    honest: [
      'If you are preparing for the Bridge Course and want all the material in one place, yes, they will help.',
      'But to be straight with you: this is not a magic shortcut. You still have to read and revise yourself. These notes just make that work a little easier.',
    ],
  },
  how: {
    kicker: 'How it works',
    title: 'Four steps, about two minutes',
    sub: 'As soon as your payment completes, the download button appears on the same page. You can do the whole thing from your phone.',
    steps: ['Enter your details', `Pay ${P} securely through Razorpay`, 'Payment is verified automatically', 'Download your notes'],
  },
  faq: { kicker: 'FAQ', title: 'Questions buyers ask' },
  help: {
    title: 'Need help?',
    body: 'Questions before buying, or a problem after paying — message us.',
    shareTitle: 'Know someone preparing?',
    shareBody: 'Share these notes in your WhatsApp group.',
    share: 'SHARE ON WHATSAPP',
  },
  teacher: {
    title: 'A small piece of advice from a teacher',
    body: 'During preparation, the hardest part is often not the studying but finding the right material. The aim here was simple: put the material in one place so your time goes into studying.',
  },
  alsoCopy: {
    title: 'Also available: Teaching Plan assignment copy',
    body: 'A printable blank शिक्षण योजना (Teaching Plan) — 12 A4 pages to fill in by hand for your assignment.',
    cta: 'See the copy — ₹29',
  },
  final: { cta: 'BUY NOW — GET INSTANT ACCESS', paid: 'Already paid?', check: 'Check payment status' },
  bar: { sub: 'PDF · instant access', buy: 'BUY NOW', share: 'Share on WhatsApp' },
  buy: {
    by: `by ${product.author} · PDF`,
    pdf: 'PDF',
    name: 'Full name', phone: 'Mobile number', email: 'Email',
    errName: 'Please enter your full name.',
    errPhone: 'Enter a valid 10-digit mobile number.',
    errEmail: 'Enter a valid email address.',
    pay: (price: string) => `PAY ${price} SECURELY`,
    opening: 'Opening secure payment…',
    verifying: 'Verifying your payment…',
    dontClose: 'Please don’t close this page.',
    secure: 'Payments are processed by Razorpay. We never see your card or UPI PIN.',
    cancel: 'Cancel',
    rzpDescription: (price: string) => `Digital PDF — ${price}`,
  },
  download: {
    reasons: {
      disabled: 'Access for this purchase has been disabled. Please contact support.',
      not_paid: 'We could not confirm your payment yet. Please contact support.',
      expired: 'Your download link has expired. Please request a new one using “Check Payment Status”.',
      limit: 'You have used all your downloads. Please contact support if you need another.',
    } as Record<string, string>,
    loadErr: 'Could not load your purchase.',
    failed: 'Download failed. Please try again.',
    started: (n: number) => `Your download has started. ${n} download${n === 1 ? '' : 's'} left.`,
    preparing: 'Preparing secure link…',
    button: 'DOWNLOAD NOTES',
    left: 'Downloads left',
    of: (n: number) => `${n} of ${MAX}`,
    ref: 'Order reference',
    note: `The download link is temporary and protected — each link works for ${MIN} minutes. Save the PDF to your phone once it opens. Keep your order reference for support.`,
    loading: 'Loading',
  },
  success: {
    title: 'Payment Successful',
    support: 'CONTACT WHATSAPP SUPPORT',
    notFoundTitle: 'We couldn’t find your purchase on this device',
    notFoundBody: 'If you have paid, use your order reference or Razorpay payment ID to get your download again.',
    check: 'CHECK PAYMENT STATUS',
  },
  failed: {
    title: 'Payment could not be completed.',
    body: 'Your order has not been granted access yet.',
    hint1: 'If money was deducted from your account, don’t pay again straight away — first use',
    hintLink: 'Check Payment Status',
    hint2: '. Payments that didn’t complete are reversed by your bank.',
    ref: 'Order reference:',
    retry: 'TRY AGAIN',
    support: 'CONTACT SUPPORT',
  },
  status: {
    title: 'Check Payment Status',
    intro: 'Paid but didn’t get the download, or closed the page? Get your access back here.',
    refLabel: 'Order reference or Razorpay payment ID',
    contactLabel: 'Mobile number or email used at checkout',
    missing: 'Enter your order reference (or Razorpay payment ID) and the mobile number or email you used.',
    processing: 'Payment verification is still processing. Checking again…',
    checking: 'Checking…',
    button: 'CHECK PAYMENT STATUS',
    hint1: 'The Razorpay payment ID (starts with',
    hint2: ') is in the payment confirmation SMS/email from Razorpay.',
    results: {
      processing: 'Payment verification is still processing. Please check again in a few minutes.',
      unpaid: 'We could not find a successful payment for this order. If money was deducted, it is usually auto-reversed by your bank; please contact support with your order reference.',
      failed: 'We could not find a successful payment for this order. If money was deducted, it is usually auto-reversed by your bank; please contact support with your order reference.',
      refunded: 'This order was refunded, so download access is no longer available.',
      cancelled: 'This order was cancelled before payment.',
    } as Record<string, string>,
  },
  whatsapp: { contact: 'CONTACT ON WHATSAPP', support: 'CONTACT SUPPORT' },
  // Client-side wording for the server's error codes (the server itself answers in English).
  errors: {} as Record<string, string>,
  genericError: 'Something went wrong. Please try again.',
  startFailed: 'Unable to start payment. Please try again.',
}

type Strings = typeof en

const hi: Strings = {
  toggleLabel: 'Read in English',
  toggleShort: 'EN',
  header: { alreadyPaid: 'भुगतान कर चुके हैं?' },
  footer: {
    terms: 'नियम व शर्तें (Terms)', privacy: 'गोपनीयता (Privacy)', refund: 'रिफ़ंड नीति', contact: 'संपर्क',
    checkStatus: 'भुगतान की स्थिति देखें', whatsapp: 'WhatsApp सहायता', copy: 'शिक्षण योजना कॉपी (₹29)',
    secured: 'भुगतान Razorpay द्वारा सुरक्षित।',
  },
  hero: {
    by: 'राकेश पांडेय द्वारा',
    tagline: 'ब्रिज कोर्स की तैयारी के लिए नोट्स — सारी बातें एक जगह, आसान भाषा में और सही क्रम में।',
    oneTime: 'एक बार का भुगतान · PDF',
    buy: `अभी खरीदें — ${P}`,
    samples: 'सैंपल पेज देखें',
    trust: ['तुरंत डिजिटल एक्सेस', 'सुरक्षित Razorpay भुगतान', 'PDF नोट्स'],
    stack: `${totals.papers} पेपर · ${totals.chapters} अध्यायों के नोट्स`,
  },
  get: {
    kicker: 'आपको क्या मिलेगा',
    title: `${totals.papers} पेपर, ${totals.chapters} अध्याय-वार नोट्स`,
    items: [
      { title: 'पाठगत प्रश्नों के उत्तर', body: 'हर पाठगत प्रश्न / Check Your Progress का सही विकल्प ✔ के साथ, और वह सही क्यों है — इसकी छोटी व्याख्या।' },
      { title: 'पाठांत प्रश्नों के उत्तर', body: 'पाठांत प्रश्न / End Exercises के व्यवस्थित उत्तर — मुख्य बिंदु, उदाहरण और निष्कर्ष के साथ।' },
      { title: 'त्वरित रिवीज़न सूची', body: 'हर इकाई के लिए त्वरित सूची / Quick Revision List और एक नज़र में उत्तर-कुंजी।' },
      { title: 'तालिकाएँ और तुलनाएँ', body: 'मुख्य बातें तालिकाओं में — जैसे EVS बनाम TWAU, विषयगत बनाम अंतर्विषयक, कौशल-वार सारांश।' },
      { title: 'अभ्यास MCQ', body: 'कई इकाइयों में उत्तर सहित अतिरिक्त अभ्यास MCQ, साथ ही Language-II के लिए रिवीज़न शीट, शब्दावली और पठन-गाइड।' },
      { title: 'हिंदी + English', body: 'पाँच पेपर हिंदी में और Pedagogy of Language-II अंग्रेज़ी में — ठीक वैसे ही जैसे कोर्स पढ़ाया जाता है।' },
    ],
    papersTitle: 'अंदर के पेपर और अध्याय',
    paper: (n: number) => `पेपर ${n}: `,
    language: { Hindi: 'हिंदी', English: 'अंग्रेज़ी' },
  },
  why: {
    kicker: 'ये नोट्स क्यों',
    title: 'रिवीज़न के लिए लिखे गए — दोबारा पढ़ने की ज़रूरत नहीं',
    items: [
      'हर इकाई एक ही क्रम में: पाठगत प्रश्न → त्वरित सूची → पाठांत प्रश्नों के उत्तर।',
      'आसान रिवीज़न — लंबे पैराग्राफ़ की जगह छोटे बिंदु और तालिकाएँ।',
      'महत्वपूर्ण अवधारणाएँ स्पष्ट रूप से, कोर्स में प्रयुक्त नीतियों (NEP 2020, NCF-FS 2022, NCF-SE 2023) के संदर्भ सहित।',
      'परीक्षा-उपयोगी: सामान्य सिद्धांत नहीं, बल्कि असली पाठगत और पाठांत प्रश्नों के उत्तर।',
      'डिजिटल PDF — किताबें साथ रखे बिना, कहीं भी फ़ोन पर पढ़ें।',
    ],
  },
  samples: {
    kicker: 'सैंपल पेज',
    title: 'खरीदने से पहले नोट्स देखें',
    tap: 'बड़ा देखने के लिए टैप करें',
    close: 'बंद करें',
    note: `प्रीव्यू में ${totals.chapters} में से सिर्फ़ 3 अध्यायों का शुरुआती हिस्सा दिखाया गया है, जिन पर “SAMPLE / PREVIEW” लिखा है।`,
    alts: [
      'सैंपल पेज — पेपर 1, इकाई 1: बाल्यावस्था को समझना (व्याख्या सहित पाठगत MCQ)',
      'सैंपल पेज — पेपर 4, Unit 4: Word Recognition (Check Your Progress के मॉडल उत्तर)',
      'सैंपल पेज — पेपर 6, इकाई 1: TWAU का स्वरूप तथा क्षेत्र (मुख्य बिंदु और तालिकाएँ)',
    ],
  },
  receive: {
    kicker: 'आपको मिलेगा',
    items: ['संपूर्ण डिजिटल PDF', 'भुगतान सफल होते ही तुरंत एक्सेस', 'मोबाइल पर आसानी से पढ़ें', 'निजी पढ़ाई के लिए डाउनलोड करें', 'कोई फ़िज़िकल डिलीवरी नहीं'],
    card: `एक बार का भुगतान · डिजिटल PDF · ${totals.chapters} अध्यायों के नोट्स`,
    cta: `नोट्स पाएँ — ${P}`,
  },
  intro: {
    question: 'ब्रिज कोर्स की तैयारी कर रहे हैं, पर समझ नहीं आ रहा कि पढ़ें क्या और सामग्री कहाँ से लाएँ?',
    answer: 'यही सोचकर ये नोट्स बनाए गए हैं। सारी बातें एक जगह हैं, आसान भाषा में और सही क्रम में। अब अलग-अलग जगह सामग्री ढूँढने में समय नहीं लगेगा।',
    whoTitle: 'ये नोट्स किसके लिए हैं?',
    who: [
      'उन शिक्षकों और अभ्यर्थियों के लिए, जो ब्रिज कोर्स कर रहे हैं और पढ़ने के लिए एक व्यवस्थित सामग्री अपने पास रखना चाहते हैं।',
      'नोट्स फ़ोन में रहेंगे। जब समय मिले, खोलकर पढ़ लीजिए और ज़रूरत हो तो दोबारा देख लीजिए।',
    ],
    honestTitle: 'क्या आपको ये नोट्स लेने चाहिए?',
    honest: [
      'अगर आप ब्रिज कोर्स की तैयारी कर रहे हैं और पूरी सामग्री एक जगह चाहते हैं, तो हाँ, ये आपके काम आएँगे।',
      'पर सीधी बात: ये कोई जादुई शॉर्टकट नहीं है। पढ़ना और दोहराना आपको ही होगा। ये नोट्स बस उस काम को थोड़ा आसान कर देते हैं।',
    ],
  },
  how: {
    kicker: 'कैसे काम करता है',
    title: 'चार आसान चरण, लगभग दो मिनट',
    sub: 'भुगतान पूरा होते ही उसी पेज पर डाउनलोड बटन आ जाता है। पूरा काम मोबाइल से हो जाता है।',
    steps: ['अपनी जानकारी भरें', `Razorpay से सुरक्षित रूप से ${P} का भुगतान करें`, 'भुगतान अपने-आप सत्यापित होता है', 'अपने नोट्स डाउनलोड करें'],
  },
  faq: { kicker: 'सवाल-जवाब', title: 'खरीदने वालों के आम सवाल' },
  help: {
    title: 'मदद चाहिए?',
    body: 'खरीदने से पहले कोई सवाल हो या भुगतान के बाद कोई समस्या — हमें मैसेज करें।',
    shareTitle: 'कोई और भी तैयारी कर रहा है?',
    shareBody: 'ये नोट्स अपने WhatsApp ग्रुप में शेयर करें।',
    share: 'WhatsApp पर शेयर करें',
  },
  teacher: {
    title: 'एक शिक्षक की छोटी-सी सलाह',
    body: 'तैयारी में अक्सर पढ़ाई से ज़्यादा मुश्किल सही सामग्री ढूँढना होता है। कोशिश यही रही है कि सामग्री एक जगह मिल जाए और आपका समय पढ़ने में लगे।',
  },
  alsoCopy: {
    title: 'साथ में: शिक्षण योजना असाइनमेंट कॉपी',
    body: 'प्रिंट करने योग्य खाली शिक्षण योजना (Teaching Plan) — असाइनमेंट के लिए हाथ से भरने वाले 12 A4 पेज।',
    cta: 'कॉपी देखें — ₹29',
  },
  final: { cta: 'अभी नोट्स पाएँ', paid: 'भुगतान कर चुके हैं?', check: 'भुगतान की स्थिति देखें' },
  bar: { sub: 'PDF · तुरंत एक्सेस', buy: 'अभी खरीदें', share: 'WhatsApp पर शेयर करें' },
  buy: {
    by: 'राकेश पांडेय द्वारा · PDF',
    pdf: 'PDF',
    name: 'पूरा नाम', phone: 'मोबाइल नंबर', email: 'ईमेल',
    errName: 'कृपया अपना पूरा नाम लिखें।',
    errPhone: 'सही 10 अंकों का मोबाइल नंबर लिखें।',
    errEmail: 'सही ईमेल पता लिखें।',
    pay: (price: string) => `${price} सुरक्षित भुगतान करें`,
    opening: 'सुरक्षित भुगतान खुल रहा है…',
    verifying: 'आपका भुगतान सत्यापित हो रहा है…',
    dontClose: 'कृपया यह पेज बंद न करें।',
    secure: 'भुगतान Razorpay द्वारा होता है। आपका कार्ड या UPI PIN हम कभी नहीं देखते।',
    cancel: 'रद्द करें',
    rzpDescription: (price: string) => `डिजिटल PDF — ${price}`,
  },
  download: {
    reasons: {
      disabled: 'इस खरीद का एक्सेस बंद कर दिया गया है। कृपया सहायता से संपर्क करें।',
      not_paid: 'हम अभी आपके भुगतान की पुष्टि नहीं कर पाए। कृपया सहायता से संपर्क करें।',
      expired: 'आपका डाउनलोड लिंक समाप्त हो गया है। “भुगतान की स्थिति देखें” से नया लिंक पाएँ।',
      limit: 'आपके सभी डाउनलोड इस्तेमाल हो चुके हैं। और डाउनलोड चाहिए तो सहायता से संपर्क करें।',
    },
    loadErr: 'आपकी खरीद की जानकारी लोड नहीं हो पाई।',
    failed: 'डाउनलोड नहीं हो पाया। कृपया फिर से कोशिश करें।',
    started: (n: number) => `आपका डाउनलोड शुरू हो गया है। ${n} डाउनलोड बाकी हैं।`,
    preparing: 'सुरक्षित लिंक तैयार हो रहा है…',
    button: 'नोट्स डाउनलोड करें',
    left: 'बाकी डाउनलोड',
    of: (n: number) => `${MAX} में से ${n}`,
    ref: 'ऑर्डर रेफ़रेंस',
    note: `डाउनलोड लिंक अस्थायी और सुरक्षित है — हर लिंक ${MIN} मिनट तक चलता है। PDF खुलते ही उसे अपने फ़ोन में सेव कर लें। सहायता के लिए अपना ऑर्डर रेफ़रेंस संभाल कर रखें।`,
    loading: 'लोड हो रहा है',
  },
  success: {
    title: 'भुगतान सफल रहा',
    support: 'WhatsApp सहायता से संपर्क करें',
    notFoundTitle: 'इस डिवाइस पर आपकी खरीद नहीं मिली',
    notFoundBody: 'अगर आपने भुगतान किया है, तो अपने ऑर्डर रेफ़रेंस या Razorpay पेमेंट ID से डाउनलोड दोबारा पाएँ।',
    check: 'भुगतान की स्थिति देखें',
  },
  failed: {
    title: 'भुगतान पूरा नहीं हो सका।',
    body: 'आपके ऑर्डर को अभी एक्सेस नहीं मिला है।',
    hint1: 'अगर आपके खाते से पैसे कट गए हैं, तो तुरंत दोबारा भुगतान न करें — पहले',
    hintLink: 'भुगतान की स्थिति देखें',
    hint2: '। जो भुगतान पूरे नहीं होते, उनकी राशि बैंक अपने-आप वापस कर देता है।',
    ref: 'ऑर्डर रेफ़रेंस:',
    retry: 'फिर से कोशिश करें',
    support: 'सहायता से संपर्क करें',
  },
  status: {
    title: 'भुगतान की स्थिति देखें',
    intro: 'भुगतान किया पर डाउनलोड नहीं मिला, या पेज बंद हो गया? अपना एक्सेस यहाँ वापस पाएँ।',
    refLabel: 'ऑर्डर रेफ़रेंस या Razorpay पेमेंट ID',
    contactLabel: 'भुगतान के समय दिया गया मोबाइल नंबर या ईमेल',
    missing: 'अपना ऑर्डर रेफ़रेंस (या Razorpay पेमेंट ID) और भुगतान के समय दिया गया मोबाइल नंबर या ईमेल लिखें।',
    processing: 'भुगतान का सत्यापन अभी चल रहा है। फिर से जाँच रहे हैं…',
    checking: 'जाँच हो रही है…',
    button: 'भुगतान की स्थिति देखें',
    hint1: 'Razorpay पेमेंट ID (जो',
    hint2: 'से शुरू होती है) Razorpay के भुगतान-पुष्टि SMS/ईमेल में मिलती है।',
    results: {
      processing: 'भुगतान का सत्यापन अभी चल रहा है। कृपया कुछ मिनट बाद फिर से देखें।',
      unpaid: 'इस ऑर्डर का कोई सफल भुगतान नहीं मिला। अगर पैसे कटे हैं, तो बैंक आमतौर पर उन्हें अपने-आप लौटा देता है; कृपया अपने ऑर्डर रेफ़रेंस के साथ सहायता से संपर्क करें।',
      failed: 'इस ऑर्डर का कोई सफल भुगतान नहीं मिला। अगर पैसे कटे हैं, तो बैंक आमतौर पर उन्हें अपने-आप लौटा देता है; कृपया अपने ऑर्डर रेफ़रेंस के साथ सहायता से संपर्क करें।',
      refunded: 'इस ऑर्डर का रिफ़ंड हो चुका है, इसलिए अब डाउनलोड एक्सेस उपलब्ध नहीं है।',
      cancelled: 'यह ऑर्डर भुगतान से पहले रद्द हो गया था।',
    },
  },
  whatsapp: { contact: 'WhatsApp पर संपर्क करें', support: 'सहायता से संपर्क करें' },
  errors: {
    network: 'नेटवर्क की समस्या। कृपया अपना इंटरनेट कनेक्शन जाँचें और फिर से कोशिश करें।',
    invalid_name: 'कृपया अपना पूरा नाम लिखें।',
    invalid_email: 'कृपया सही ईमेल पता लिखें।',
    invalid_phone: 'कृपया सही 10 अंकों का भारतीय मोबाइल नंबर लिखें।',
    invalid_product: 'यह प्रोडक्ट उपलब्ध नहीं है।',
    inactive_product: 'यह प्रोडक्ट अभी उपलब्ध नहीं है।',
    rate_limited: 'बहुत ज़्यादा प्रयास हो गए। कृपया थोड़ी देर बाद कोशिश करें, या सहायता से संपर्क करें।',
    locked: 'इस ऑर्डर के लिए बहुत ज़्यादा प्रयास हो गए। कृपया सहायता से संपर्क करें।',
    gateway_error: 'भुगतान शुरू नहीं हो सका। कृपया फिर से कोशिश करें।',
    not_found: 'कोई मिलता-जुलता ऑर्डर नहीं मिला। कृपया ऑर्डर रेफ़रेंस और भुगतान के समय दिया गया ईमेल या मोबाइल नंबर जाँचें।',
    unknown_order: 'हम अभी आपके भुगतान की पुष्टि नहीं कर पाए। कृपया सहायता से संपर्क करें।',
    bad_signature: 'हम अभी आपके भुगतान की पुष्टि नहीं कर पाए। कृपया सहायता से संपर्क करें।',
    mismatch: 'हम अभी आपके भुगतान की पुष्टि नहीं कर पाए। कृपया सहायता से संपर्क करें।',
    payment_failed: 'भुगतान पूरा नहीं हो सका।',
    invalid: 'यह डाउनलोड लिंक मान्य नहीं है।',
    disabled: 'इस खरीद का एक्सेस बंद कर दिया गया है। कृपया सहायता से संपर्क करें।',
    not_paid: 'हम अभी आपके भुगतान की पुष्टि नहीं कर पाए। कृपया सहायता से संपर्क करें।',
    expired: 'आपका डाउनलोड लिंक समाप्त हो गया है। कृपया नया लिंक पाएँ।',
    limit: 'डाउनलोड की सीमा पूरी हो गई है। और डाउनलोड चाहिए तो सहायता से संपर्क करें।',
    file_unavailable: 'डाउनलोड अभी अस्थायी रूप से उपलब्ध नहीं है। कृपया कुछ मिनट बाद कोशिश करें या सहायता से संपर्क करें।',
  },
  genericError: 'कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।',
  startFailed: 'भुगतान शुरू नहीं हो सका। कृपया फिर से कोशिश करें।',
}

export const strings: Record<Lang, Strings> = { hi, en }

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'hi' || saved === 'en') return saved
  } catch {
    // storage blocked — fall through to the default
  }
  return 'hi'
}

type Ctx = { lang: Lang; t: Strings; setLang: (l: Lang) => void; toggle: () => void; errorText: (e: unknown, fallback?: string) => string }
const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  }, [])

  const value = useMemo<Ctx>(() => {
    const t = strings[lang]
    return {
      lang,
      t,
      setLang,
      toggle: () => setLang(lang === 'hi' ? 'en' : 'hi'),
      // ApiError carries the server's English message plus a stable `code`.
      errorText: (e, fallback = t.genericError) => {
        if (!(e instanceof ApiError)) return fallback
        return t.errors[e.code] ?? (lang === 'en' ? e.message : fallback)
      },
    }
  }, [lang, setLang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
