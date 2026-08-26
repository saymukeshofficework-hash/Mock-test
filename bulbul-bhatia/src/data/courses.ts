import { Bilingual, Course, CourseLevel } from './types'

export const LEVEL_LABEL: Record<CourseLevel, Bilingual> = {
  basic: { en: 'Simple / Basic', hi: 'सरल / बेसिक' },
  advanced: { en: 'Advanced', hi: 'एडवांस्ड' },
}

export const astrologyCourses: Course[] = [
  {
    slug: 'astrology-course-basic',
    category: 'astrology',
    level: 'basic',
    title: { en: 'Astrology Course — Simple / Basic', hi: 'ज्योतिष कोर्स — सरल / बेसिक' },
    description: {
      en: 'Start learning Vedic astrology from the ground up — charts, planets and the fundamentals.',
      hi: 'शुरुआत से वैदिक ज्योतिष सीखें — कुंडली, ग्रह और मूल बातें।',
    },
    overview: {
      en: 'A focused introduction to Vedic astrology, covering the birth chart, planets, signs and houses so you can read a basic Kundli with confidence.',
      hi: 'वैदिक ज्योतिष का एक केंद्रित परिचय, जिसमें जन्म कुंडली, ग्रह, राशियां और भाव शामिल हैं, ताकि आप आत्मविश्वास के साथ एक बेसिक कुंडली पढ़ सकें।',
    },
    whatYouLearn: [
      { en: 'Core concepts: planets, signs, houses and the birth chart', hi: 'मूल अवधारणाएं: ग्रह, राशियां, भाव एवं जन्म कुंडली' },
      { en: 'How to read a Kundli\'s basic layout with confidence', hi: 'आत्मविश्वास के साथ कुंडली का मूल ढांचा पढ़ना' },
      { en: 'Foundational terminology used throughout astrology', hi: 'ज्योतिष में प्रयुक्त मूलभूत शब्दावली' },
    ],
    whoItsFor: { en: 'Complete beginners with no prior background in astrology.', hi: 'ज्योतिष में बिना किसी पूर्व अनुभव वाले पूर्ण शुरुआती लोगों के लिए।' },
    modules: [
      { en: 'Introduction to Vedic Astrology', hi: 'वैदिक ज्योतिष का परिचय' },
      { en: 'Planets, Signs & Houses', hi: 'ग्रह, राशियां एवं भाव' },
      { en: 'Reading a Basic Birth Chart', hi: 'बेसिक जन्म कुंडली पढ़ना' },
    ],
    duration: { en: '15 Days', hi: '15 दिन' },
    price: '₹799',
  },
  {
    slug: 'astrology-course-advanced',
    category: 'astrology',
    level: 'advanced',
    title: { en: 'Astrology Course — Advanced', hi: 'ज्योतिष कोर्स — एडवांस्ड' },
    description: {
      en: 'Go deeper into chart analysis, dashas and predictive technique.',
      hi: 'कुंडली विश्लेषण, दशा एवं भविष्यसूचक तकनीक में गहराई से जाएं।',
    },
    overview: {
      en: 'Builds on the basics to cover deeper chart analysis, dasha systems and predictive technique, so you can interpret a full Kundli in depth.',
      hi: 'बेसिक ज्ञान पर आधारित यह कोर्स गहन कुंडली विश्लेषण, दशा प्रणाली एवं भविष्यसूचक तकनीक को कवर करता है, ताकि आप एक पूर्ण कुंडली की गहराई से व्याख्या कर सकें।',
    },
    whatYouLearn: [
      { en: 'Deeper chart analysis: aspects, combinations and yogas', hi: 'गहन कुंडली विश्लेषण: दृष्टि, संयोजन एवं योग' },
      { en: 'Dasha and transit-based predictive technique', hi: 'दशा एवं गोचर आधारित भविष्यसूचक तकनीक' },
      { en: 'Working confidently with real, layered client questions', hi: 'वास्तविक, बहुस्तरीय ग्राहक प्रश्नों पर आत्मविश्वास से काम करना' },
    ],
    whoItsFor: { en: 'Those with basic astrology knowledge who want to go deeper.', hi: 'बेसिक ज्योतिष ज्ञान रखने वाले लोग जो और गहराई में जाना चाहते हैं।' },
    modules: [
      { en: 'Advanced Chart Analysis', hi: 'उन्नत कुंडली विश्लेषण' },
      { en: 'Dasha & Transit Technique', hi: 'दशा एवं गोचर तकनीक' },
      { en: 'Applied Practice with Real Charts', hi: 'वास्तविक कुंडलियों के साथ व्यावहारिक अभ्यास' },
    ],
    duration: { en: '1 Month', hi: '1 माह' },
    price: '₹1,999',
  },
]

export const tarotCourses: Course[] = [
  {
    slug: 'tarot-course-basic',
    category: 'tarot',
    level: 'basic',
    title: { en: 'Tarot Course — Simple / Basic', hi: 'टैरो कोर्स — सरल / बेसिक' },
    description: {
      en: 'Start your Tarot journey with the fundamentals of the deck.',
      hi: 'डेक की मूल बातों के साथ अपनी टैरो यात्रा शुरू करें।',
    },
    overview: {
      en: 'An introduction to the Tarot deck — Major and Minor Arcana, simple spreads and how to approach a reading with confidence.',
      hi: 'टैरो डेक का परिचय — मेजर एवं माइनर आर्काना, सरल स्प्रेड और आत्मविश्वास के साथ रीडिंग करने का तरीका।',
    },
    whatYouLearn: [
      { en: 'The Major and Minor Arcana and what each card represents', hi: 'मेजर एवं माइनर आर्काना और प्रत्येक कार्ड का अर्थ' },
      { en: 'How to do simple one and three-card readings', hi: 'सरल वन-कार्ड एवं थ्री-कार्ड रीडिंग कैसे करें' },
      { en: 'Building a consistent, honest reading practice', hi: 'निरंतर एवं ईमानदार रीडिंग अभ्यास कैसे बनाएं' },
    ],
    whoItsFor: { en: 'Complete beginners with no prior background in Tarot.', hi: 'टैरो में बिना किसी पूर्व अनुभव वाले पूर्ण शुरुआती लोगों के लिए।' },
    modules: [
      { en: 'Introduction to the Tarot Deck', hi: 'टैरो डेक का परिचय' },
      { en: 'Major & Minor Arcana', hi: 'मेजर एवं माइनर आर्काना' },
      { en: 'Simple Spreads & Guided Practice', hi: 'सरल स्प्रेड एवं निर्देशित अभ्यास' },
    ],
    duration: { en: '15 Days', hi: '15 दिन' },
    price: '₹799',
  },
  {
    slug: 'tarot-course-advanced',
    category: 'tarot',
    level: 'advanced',
    title: { en: 'Tarot Course — Advanced', hi: 'टैरो कोर्स — एडवांस्ड' },
    description: {
      en: 'Work with complex spreads and nuanced client questions.',
      hi: 'जटिल स्प्रेड और संवेदनशील ग्राहक प्रश्नों पर काम करें।',
    },
    overview: {
      en: 'Builds on the basics to cover complex spreads, card combinations and how to read for nuanced, layered client questions.',
      hi: 'बेसिक ज्ञान पर आधारित यह कोर्स जटिल स्प्रेड, कार्ड संयोजन और संवेदनशील, बहुस्तरीय ग्राहक प्रश्नों के लिए रीडिंग को कवर करता है।',
    },
    whatYouLearn: [
      { en: 'Complex, multi-card spreads and layered interpretation', hi: 'जटिल, बहु-कार्ड स्प्रेड एवं बहुस्तरीय व्याख्या' },
      { en: 'Reading card combinations and reversed cards', hi: 'कार्ड संयोजन एवं उल्टे कार्ड पढ़ना' },
      { en: 'Handling sensitive, real client questions with care', hi: 'संवेदनशील, वास्तविक ग्राहक प्रश्नों को सावधानी से संभालना' },
    ],
    whoItsFor: { en: 'Those with basic Tarot knowledge who want to go deeper.', hi: 'बेसिक टैरो ज्ञान रखने वाले लोग जो और गहराई में जाना चाहते हैं।' },
    modules: [
      { en: 'Advanced Spreads', hi: 'उन्नत स्प्रेड' },
      { en: 'Card Combinations & Reversals', hi: 'कार्ड संयोजन एवं उल्टे कार्ड' },
      { en: 'Applied Practice with Real Questions', hi: 'वास्तविक प्रश्नों के साथ व्यावहारिक अभ्यास' },
    ],
    duration: { en: '1 Month', hi: '1 माह' },
    price: '₹1,999',
  },
]

export const handwritingCourses: Course[] = [
  {
    slug: 'handwriting-signature-analysis-course',
    category: 'handwriting',
    title: { en: 'Handwriting & Signature Analysis Course', hi: 'हस्तलेख एवं हस्ताक्षर विश्लेषण कोर्स' },
    description: {
      en: 'Learn to read personality traits and tendencies from handwriting and signature style.',
      hi: 'हस्तलेख एवं हस्ताक्षर की शैली से व्यक्तित्व लक्षणों को पढ़ना सीखें।',
    },
    overview: {
      en: 'An introduction to handwriting and signature analysis (graphology) — how letter shape, slant, spacing and signature style can reflect personality traits and tendencies.',
      hi: 'हस्तलेख एवं हस्ताक्षर विश्लेषण (ग्राफोलॉजी) का परिचय — कैसे अक्षरों का आकार, झुकाव, दूरी एवं हस्ताक्षर शैली व्यक्तित्व लक्षणों को दर्शा सकती है।',
    },
    whatYouLearn: [
      { en: 'The core principles of handwriting analysis', hi: 'हस्तलेख विश्लेषण के मूल सिद्धांत' },
      { en: 'Reading letter shape, slant, size and spacing', hi: 'अक्षरों का आकार, झुकाव, आकार एवं दूरी पढ़ना' },
      { en: 'How signature style is analyzed alongside handwriting', hi: 'हस्तलेख के साथ हस्ताक्षर शैली का विश्लेषण कैसे किया जाता है' },
    ],
    whoItsFor: { en: 'Complete beginners with no prior background in handwriting analysis.', hi: 'हस्तलेख विश्लेषण में बिना किसी पूर्व अनुभव वाले पूर्ण शुरुआती लोगों के लिए।' },
    modules: [
      { en: 'Introduction to Handwriting Analysis', hi: 'हस्तलेख विश्लेषण का परिचय' },
      { en: 'Reading Letter Shape, Slant & Spacing', hi: 'अक्षर आकार, झुकाव एवं दूरी पढ़ना' },
      { en: 'Signature Analysis & Guided Practice', hi: 'हस्ताक्षर विश्लेषण एवं निर्देशित अभ्यास' },
    ],
    duration: { en: '10 Days', hi: '10 दिन' },
    price: '₹499',
  },
]

export const allCourses: Course[] = [...astrologyCourses, ...tarotCourses, ...handwritingCourses]

export const learningLevels: { id: CourseLevel; label: Bilingual }[] = [
  { id: 'basic', label: LEVEL_LABEL.basic },
  { id: 'advanced', label: LEVEL_LABEL.advanced },
]
