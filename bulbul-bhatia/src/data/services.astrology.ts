import { Service } from './types'

export const astrologyServices: Service[] = [
  {
    slug: 'janam-kundli-reading',
    category: 'astrology',
    icon: '🪐',
    featured: true,
    name: { en: 'Janam Kundli Reading', hi: 'जन्म कुंडली विश्लेषण' },
    description: {
      en: 'A complete birth chart reading covering personality, strengths and key life areas.',
      hi: 'व्यक्तित्व, क्षमताओं और जीवन के प्रमुख क्षेत्रों को कवर करने वाला संपूर्ण जन्म कुंडली विश्लेषण।',
    },
  },
  {
    slug: 'kundli-milan',
    category: 'astrology',
    icon: '💫',
    featured: true,
    name: { en: 'Kundli Milan', hi: 'कुंडली मिलान' },
    description: {
      en: 'Ashtakoot-based matching to understand compatibility between two charts before marriage.',
      hi: 'विवाह से पहले दो कुंडलियों के बीच अनुकूलता समझने के लिए अष्टकूट आधारित मिलान।',
    },
  },
  {
    slug: 'marriage-prediction',
    category: 'astrology',
    icon: '💍',
    featured: true,
    name: { en: 'Marriage Prediction', hi: 'विवाह भविष्यवाणी' },
    description: {
      en: 'Insight into marriage timing, prospects and considerations based on your chart.',
      hi: 'आपकी कुंडली के आधार पर विवाह के समय और संभावनाओं की जानकारी।',
    },
  },
  {
    slug: 'career-astrology',
    category: 'astrology',
    icon: '📈',
    featured: true,
    name: { en: 'Career Astrology', hi: 'करियर ज्योतिष' },
    description: {
      en: 'Understand your professional strengths, direction and favourable periods.',
      hi: 'अपनी पेशेवर क्षमताओं, दिशा और अनुकूल समय को समझें।',
    },
  },
  {
    slug: 'job-prediction',
    category: 'astrology',
    icon: '💼',
    name: { en: 'Job Prediction', hi: 'नौकरी भविष्यवाणी' },
    description: {
      en: 'Guidance on employment opportunities and timing based on planetary periods.',
      hi: 'ग्रहों की दशा के आधार पर नौकरी के अवसरों और समय पर मार्गदर्शन।',
    },
  },
  {
    slug: 'business-astrology',
    category: 'astrology',
    icon: '🏛️',
    name: { en: 'Business Astrology', hi: 'व्यापार ज्योतिष' },
    description: {
      en: 'Astrological insight for business decisions, partnerships and growth periods.',
      hi: 'व्यावसायिक निर्णयों, साझेदारी और विकास के लिए ज्योतिषीय दृष्टिकोण।',
    },
  },
  {
    slug: 'financial-astrology',
    category: 'astrology',
    icon: '💰',
    name: { en: 'Financial Astrology', hi: 'वित्तीय ज्योतिष' },
    description: {
      en: 'Understand wealth potential, financial patterns and favourable periods.',
      hi: 'धन क्षमता, वित्तीय पैटर्न और अनुकूल समय को समझें।',
    },
  },
  {
    slug: 'love-relationship-astrology',
    category: 'astrology',
    icon: '💗',
    featured: true,
    name: { en: 'Love & Relationship Astrology', hi: 'प्रेम एवं संबंध ज्योतिष' },
    description: {
      en: 'Clarity on relationship dynamics, compatibility and emotional patterns.',
      hi: 'रिश्तों की गतिशीलता, अनुकूलता और भावनात्मक पैटर्न पर स्पष्टता।',
    },
  },
  {
    slug: 'education-astrology',
    category: 'astrology',
    icon: '📚',
    name: { en: 'Education Astrology', hi: 'शिक्षा ज्योतिष' },
    description: {
      en: 'Guidance on academic strengths, favourable streams and study periods.',
      hi: 'शैक्षणिक क्षमताओं, अनुकूल विषयों और अध्ययन के समय पर मार्गदर्शन।',
    },
  },
  {
    slug: 'health-astrology',
    category: 'astrology',
    icon: '🌿',
    name: { en: 'Health Astrology', hi: 'स्वास्थ्य ज्योतिष' },
    description: {
      en: 'General astrological perspective on health patterns — not a medical diagnosis.',
      hi: 'स्वास्थ्य पैटर्न पर सामान्य ज्योतिषीय दृष्टिकोण — यह चिकित्सा निदान नहीं है।',
    },
  },
  {
    slug: 'foreign-travel-settlement',
    category: 'astrology',
    icon: '✈️',
    name: { en: 'Foreign Travel & Settlement', hi: 'विदेश यात्रा एवं निवास योग' },
    description: {
      en: 'Insight into prospects for travel, study or settlement abroad.',
      hi: 'विदेश यात्रा, अध्ययन या निवास की संभावनाओं की जानकारी।',
    },
  },
  {
    slug: 'child-progeny-astrology',
    category: 'astrology',
    icon: '👶',
    name: { en: 'Child & Progeny Astrology', hi: 'संतान ज्योतिष' },
    description: {
      en: 'Guidance on progeny-related questions based on your birth chart.',
      hi: 'आपकी जन्म कुंडली के आधार पर संतान से जुड़े प्रश्नों पर मार्गदर्शन।',
    },
  },
  {
    slug: 'property-vehicle-astrology',
    category: 'astrology',
    icon: '🏠',
    name: { en: 'Property & Vehicle Astrology', hi: 'संपत्ति एवं वाहन ज्योतिष' },
    description: {
      en: 'Understand favourable periods for property and vehicle purchase.',
      hi: 'संपत्ति एवं वाहन खरीद के लिए अनुकूल समय को समझें।',
    },
  },
  {
    slug: 'name-analysis',
    category: 'astrology',
    icon: '🔤',
    name: { en: 'Name Analysis', hi: 'नाम विश्लेषण' },
    description: {
      en: 'Numerological analysis of your name and its influence on your life.',
      hi: 'आपके नाम का अंकशास्त्रीय विश्लेषण और जीवन पर इसका प्रभाव।',
    },
  },
  {
    slug: 'numerology',
    category: 'astrology',
    icon: '🔢',
    name: { en: 'Numerology', hi: 'अंक ज्योतिष' },
    description: {
      en: 'Explore your core numbers and what they reveal about your path.',
      hi: 'अपने मूल अंकों का पता लगाएं और जानें कि वे आपके मार्ग के बारे में क्या बताते हैं।',
    },
  },
  {
    slug: 'handwriting-signature-analysis',
    category: 'astrology',
    icon: '✍️',
    name: { en: 'Handwriting & Signature Analysis', hi: 'हस्तलेख एवं हस्ताक्षर विश्लेषण' },
    description: {
      en: 'Understand personality traits and tendencies reflected in your handwriting and signature style.',
      hi: 'आपके हस्तलेख एवं हस्ताक्षर की शैली में झलकने वाले व्यक्तित्व लक्षणों को समझें।',
    },
  },
  {
    slug: 'lucky-number-date',
    category: 'astrology',
    icon: '🍀',
    name: { en: 'Lucky Number & Date', hi: 'शुभ अंक एवं तिथि' },
    description: {
      en: 'Identify personally favourable numbers and dates for key decisions.',
      hi: 'महत्वपूर्ण निर्णयों के लिए व्यक्तिगत रूप से अनुकूल अंक और तिथियां जानें।',
    },
  },
  {
    slug: 'muhurat-consultation',
    category: 'astrology',
    icon: '🕉️',
    name: { en: 'Muhurat Consultation', hi: 'मुहूर्त परामर्श' },
    description: {
      en: 'Find an auspicious time for weddings, griha pravesh and other events.',
      hi: 'विवाह, गृह प्रवेश और अन्य कार्यों के लिए शुभ मुहूर्त जानें।',
    },
  },
  {
    slug: 'dasha-analysis',
    category: 'astrology',
    icon: '🌗',
    featured: true,
    name: { en: 'Dasha Analysis', hi: 'दशा विश्लेषण' },
    description: {
      en: 'Understand the current and upcoming planetary periods shaping your life.',
      hi: 'आपके जीवन को प्रभावित कर रही वर्तमान एवं आगामी ग्रह दशाओं को समझें।',
    },
  },
  {
    slug: 'gochar-transit-analysis',
    category: 'astrology',
    icon: '🔭',
    name: { en: 'Gochar / Transit Analysis', hi: 'गोचर विश्लेषण' },
    description: {
      en: 'See how current planetary transits are affecting your birth chart.',
      hi: 'वर्तमान ग्रह गोचर आपकी जन्म कुंडली को कैसे प्रभावित कर रहे हैं, जानें।',
    },
  },
  {
    slug: 'annual-horoscope',
    category: 'astrology',
    icon: '📅',
    name: { en: 'Annual Horoscope', hi: 'वार्षिक राशिफल' },
    description: {
      en: 'A year-ahead overview of key themes across life areas.',
      hi: 'जीवन के प्रमुख क्षेत्रों में आने वाले वर्ष का विस्तृत विवरण।',
    },
  },
  {
    slug: 'monthly-horoscope',
    category: 'astrology',
    icon: '🗓️',
    name: { en: 'Monthly Horoscope', hi: 'मासिक राशिफल' },
    description: {
      en: 'A month-by-month look at trends relevant to your sign.',
      hi: 'आपकी राशि से जुड़े रुझानों का माह-दर-माह विवरण।',
    },
  },
  {
    slug: 'prashna-kundli',
    category: 'astrology',
    icon: '❓',
    name: { en: 'Prashna Kundli', hi: 'प्रश्न कुंडली' },
    description: {
      en: 'Horary astrology to answer a specific, pressing question.',
      hi: 'किसी विशेष एवं तत्काल प्रश्न के उत्तर के लिए प्रश्न कुंडली विश्लेषण।',
    },
  },
  {
    slug: 'astrology-remedies',
    category: 'astrology',
    icon: '🪔',
    featured: true,
    name: { en: 'Astrology Remedies', hi: 'ज्योतिष उपाय' },
    description: {
      en: 'Simple, personalized remedies to support balance in your chart.',
      hi: 'आपकी कुंडली में संतुलन बनाए रखने हेतु सरल, व्यक्तिगत उपाय।',
    },
  },
  {
    slug: 'gemstone-consultation',
    category: 'astrology',
    icon: '💎',
    featured: true,
    name: { en: 'Gemstone Consultation', hi: 'रत्न परामर्श' },
    description: {
      en: 'Guidance on gemstones suited to your chart, with sensible precautions.',
      hi: 'आपकी कुंडली के अनुकूल रत्नों पर सावधानीपूर्ण मार्गदर्शन।',
    },
  },
  {
    slug: 'rudraksha-consultation',
    category: 'astrology',
    icon: '📿',
    name: { en: 'Rudraksha Consultation', hi: 'रुद्राक्ष परामर्श' },
    description: {
      en: 'Guidance on Rudraksha selection based on your chart and needs.',
      hi: 'आपकी कुंडली एवं आवश्यकताओं के आधार पर रुद्राक्ष चयन पर मार्गदर्शन।',
    },
  },
  {
    slug: 'vastu-consultation',
    category: 'astrology',
    icon: '🧭',
    name: { en: 'Vastu Consultation', hi: 'वास्तु परामर्श' },
    description: {
      en: 'Practical Vastu guidance for home and workspace harmony.',
      hi: 'घर एवं कार्यस्थल में सामंजस्य के लिए व्यावहारिक वास्तु मार्गदर्शन।',
    },
  },
  {
    slug: 'graha-shanti',
    category: 'astrology',
    icon: '🔥',
    name: { en: 'Graha Shanti', hi: 'ग्रह शांति' },
    description: {
      en: 'Guidance on traditional practices for easing challenging planetary influences.',
      hi: 'कठिन ग्रह प्रभावों को शांत करने की पारंपरिक विधियों पर मार्गदर्शन।',
    },
  },
]
