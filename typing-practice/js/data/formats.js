// The four typing formats offered on the page. `lang` drives performance bands
// and share text; `font` is informational (the CSS class comes from the adapter).

export const FORMATS = [
  { id: "english", lang: "en", label: { en: "English", hi: "English" }, native: "English", desc: { en: "English typing practice.", hi: "अंग्रेज़ी टाइपिंग अभ्यास।" } },
  { id: "hindi-unicode", lang: "hi", label: { en: "Hindi Unicode", hi: "हिंदी Unicode" }, native: "हिंदी यूनिकोड टाइपिंग", desc: { en: "Inscript, phonetic or any Hindi keyboard.", hi: "Inscript, फ़ोनेटिक या कोई भी हिंदी कीबोर्ड।" } },
  { id: "mangal", lang: "hi", label: { en: "Mangal", hi: "मंगल" }, native: "देवनागरी Unicode", desc: { en: "Devanagari Unicode typing in the Mangal font, as in govt. exams.", hi: "सरकारी परीक्षाओं की तरह मंगल फ़ॉन्ट में देवनागरी Unicode टाइपिंग।" } },
  { id: "krutidev", lang: "hi", label: { en: "Krutidev", hi: "कृतिदेव" }, native: "Kruti Dev 010", desc: { en: "Krutidev font based Hindi typing (Remington layout).", hi: "कृतिदेव फ़ॉन्ट पर हिंदी टाइपिंग (रेमिंगटन लेआउट)।" } },
];

export function getFormat(id) {
  return FORMATS.find((f) => f.id === id) || FORMATS[0];
}

export const DURATIONS = [15, 30, 60, 120, 300, 600];
