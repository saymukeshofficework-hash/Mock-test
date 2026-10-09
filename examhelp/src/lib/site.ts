/**
 * Site-wide configuration. Anything environment-specific (URLs, contact
 * details, analytics IDs) comes from environment variables — never hard-code.
 */
export const site = {
  name: "TETTESTHUB",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  tagline: {
    hi: "मध्यप्रदेश की परीक्षाओं की तैयारी — एक ही जगह",
    en: "Preparation for Madhya Pradesh exams — in one place",
  },
  seo: {
    title: "TETTESTHUB – MP Exams, Notes, Test Series & Latest Government Exam Updates",
    description:
      "Prepare for MPPSC, MPESB, MP TET, Police, Teacher, Group and other Madhya Pradesh government exams with notes, test series, practice tests and latest exam updates.",
  },
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || "",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/918770375866",
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },
  officialSources: [
    { name: "MPESB", fullName: { hi: "मध्यप्रदेश कर्मचारी चयन मंडल", en: "MP Employees Selection Board" }, url: "https://esb.mp.gov.in/" },
    { name: "MPPSC", fullName: { hi: "मध्यप्रदेश लोक सेवा आयोग", en: "MP Public Service Commission" }, url: "https://mppsc.mp.gov.in/" },
    { name: "MP High Court", fullName: { hi: "मध्यप्रदेश उच्च न्यायालय", en: "High Court of Madhya Pradesh" }, url: "https://mphc.gov.in/" },
    { name: "MP Govt", fullName: { hi: "मध्यप्रदेश शासन", en: "Government of Madhya Pradesh" }, url: "https://mp.gov.in/" },
  ],
};
