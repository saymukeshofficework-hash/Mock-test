import { Consultation } from './types'

// The Consultations offering is intentionally exactly these three,
// flat-priced services — see src/data/services.astrology.ts and
// services.tarot.ts for the full menu of specific reading topics that
// can be discussed within an Astrology or Tarot consultation.
export const consultations: Consultation[] = [
  {
    slug: 'astrology-consultation',
    name: { en: 'Astrology Consultation', hi: 'ज्योतिष परामर्श' },
    price: { en: '₹499 per Kundli', hi: '₹499 प्रति कुंडली' },
    description: {
      en: 'A personalized astrology consultation based on your birth chart.',
      hi: 'आपकी जन्म कुंडली के आधार पर एक व्यक्तिगत ज्योतिष परामर्श।',
    },
    icon: '🪐',
    bookingType: 'astrology',
  },
  {
    slug: 'tarot-consultation',
    name: { en: 'Tarot Consultation', hi: 'टैरो परामर्श' },
    price: { en: '₹499 per Person', hi: '₹499 प्रति व्यक्ति' },
    description: {
      en: 'A personalized Tarot reading for clarity on your questions.',
      hi: 'आपके प्रश्नों पर स्पष्टता के लिए एक व्यक्तिगत टैरो रीडिंग।',
    },
    icon: '🔮',
    bookingType: 'tarot',
  },
  {
    slug: 'handwriting-signature-analysis',
    name: { en: 'Handwriting & Signature Analysis', hi: 'हस्तलेख एवं हस्ताक्षर विश्लेषण' },
    price: { en: '₹199 per Person', hi: '₹199 प्रति व्यक्ति' },
    description: {
      en: 'Personality insight based on your handwriting and signature style.',
      hi: 'आपके हस्तलेख एवं हस्ताक्षर की शैली के आधार पर व्यक्तित्व अंतर्दृष्टि।',
    },
    icon: '✍️',
    bookingType: 'handwriting',
  },
]
