/* Site configuration — the ONLY place business/contact facts live.
   Leave a field "" until the owner supplies a real value; UI must hide
   the related element gracefully rather than showing a broken link. */
const SITE_CONFIG = {
  name: "BBC English Coaching Classes Burhar",
  shortName: "BBC English Burhar",
  tagline: "Don't Just Learn English. Use It.",
  positioning: "Practical English. Confident Speaking. Daily Practice.",
  city: "Burhar",
  district: "Shahdol",
  state: "Madhya Pradesh",
  country: "India",

  phone: "",
  whatsapp: "",
  email: "",
  instagram: "",
  youtube: "",
  facebook: "",
  address: "",
  mapsUrl: "",

  // Course pricing placeholders — no values, no checkout UI. For future use only.
  pricing: {
    spokenEnglish: null,
    schoolEnglish: null,
    grammarMastery: null,
    vocabularyBuilder: null,
    interviewEnglish: null,
    competitiveExamEnglish: null
  }
};

function siteConfigHref(type) {
  switch (type) {
    case "phone":
      return SITE_CONFIG.phone ? `tel:${SITE_CONFIG.phone}` : "";
    case "whatsapp":
      return SITE_CONFIG.whatsapp ? `https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, "")}` : "";
    case "email":
      return SITE_CONFIG.email ? `mailto:${SITE_CONFIG.email}` : "";
    default:
      return "";
  }
}
