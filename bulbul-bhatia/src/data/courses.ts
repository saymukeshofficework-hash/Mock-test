import { Bilingual, Course, CourseLevel } from './types'

interface RawCourse {
  slug: string
  category: 'tarot' | 'astrology'
  level: CourseLevel
  title: Bilingual
  description: Bilingual
  featured?: boolean
}

const levelContent: Record<CourseLevel, { learn: Bilingual[]; who: Bilingual; modules: Bilingual[] }> = {
  Beginner: {
    learn: [
      { en: 'Foundational concepts and terminology', hi: 'मूलभूत अवधारणाएं और शब्दावली' },
      { en: 'How to approach a reading or chart with confidence', hi: 'आत्मविश्वास के साथ रीडिंग या कुंडली को कैसे समझें' },
      { en: 'Building a consistent, honest practice', hi: 'निरंतर एवं ईमानदार अभ्यास कैसे बनाएं' },
    ],
    who: { en: 'Complete beginners with no prior background.', hi: 'बिना किसी पूर्व अनुभव वाले पूर्ण शुरुआती लोगों के लिए।' },
    modules: [
      { en: 'Introduction & Core Concepts', hi: 'परिचय एवं मूल अवधारणाएं' },
      { en: 'Foundational Tools & Terminology', hi: 'मूलभूत उपकरण एवं शब्दावली' },
      { en: 'Guided Practice', hi: 'निर्देशित अभ्यास' },
    ],
  },
  Basic: {
    learn: [
      { en: 'Practical application of foundational concepts', hi: 'मूलभूत अवधारणाओं का व्यावहारिक प्रयोग' },
      { en: 'Reading simple, real-world questions with structure', hi: 'सरल, वास्तविक प्रश्नों को संरचित तरीके से समझना' },
      { en: 'Common patterns and how to interpret them', hi: 'सामान्य पैटर्न और उनकी व्याख्या' },
    ],
    who: { en: 'Those who know the basics and want structured practice.', hi: 'जो मूल बातें जानते हैं और संरचित अभ्यास चाहते हैं।' },
    modules: [
      { en: 'Applied Fundamentals', hi: 'व्यावहारिक मूल बातें' },
      { en: 'Structured Reading Practice', hi: 'संरचित रीडिंग अभ्यास' },
      { en: 'Common Patterns & Interpretation', hi: 'सामान्य पैटर्न एवं व्याख्या' },
    ],
  },
  Intermediate: {
    learn: [
      { en: 'Deeper interpretive techniques and combinations', hi: 'गहन व्याख्यात्मक तकनीकें एवं संयोजन' },
      { en: 'Working confidently with layered, multi-part questions', hi: 'बहुस्तरीय प्रश्नों पर आत्मविश्वास से काम करना' },
      { en: 'Refining your own reading style', hi: 'अपनी रीडिंग शैली को परिष्कृत करना' },
    ],
    who: { en: 'Students with basic knowledge who want to go deeper.', hi: 'मूलभूत ज्ञान रखने वाले छात्र जो और गहराई में जाना चाहते हैं।' },
    modules: [
      { en: 'Advanced Interpretive Techniques', hi: 'उन्नत व्याख्यात्मक तकनीकें' },
      { en: 'Combinations & Layered Analysis', hi: 'संयोजन एवं बहुस्तरीय विश्लेषण' },
      { en: 'Developing Your Reading Style', hi: 'अपनी रीडिंग शैली विकसित करना' },
    ],
  },
  Advanced: {
    learn: [
      { en: 'Complex chart or spread analysis', hi: 'जटिल कुंडली या स्प्रेड विश्लेषण' },
      { en: 'Handling nuanced, sensitive client questions', hi: 'संवेदनशील ग्राहक प्रश्नों को सही ढंग से संभालना' },
      { en: 'Cross-referencing multiple techniques', hi: 'कई तकनीकों का परस्पर संदर्भ' },
    ],
    who: { en: 'Intermediate students ready for advanced technique.', hi: 'उन्नत तकनीक के लिए तैयार मध्यवर्ती छात्रों के लिए।' },
    modules: [
      { en: 'Complex Analysis Techniques', hi: 'जटिल विश्लेषण तकनीकें' },
      { en: 'Sensitive & Layered Client Questions', hi: 'संवेदनशील एवं बहुस्तरीय ग्राहक प्रश्न' },
      { en: 'Cross-Technique Practice', hi: 'क्रॉस-तकनीक अभ्यास' },
    ],
  },
  Professional: {
    learn: [
      { en: 'Structuring and delivering client-ready readings', hi: 'ग्राहकों के लिए तैयार रीडिंग की संरचना एवं प्रस्तुति' },
      { en: 'Practice ethics, boundaries and communication', hi: 'अभ्यास नैतिकता, सीमाएं एवं संवाद' },
      { en: 'Building confidence to practice professionally', hi: 'पेशेवर रूप से अभ्यास करने का आत्मविश्वास बनाना' },
    ],
    who: { en: 'Advanced students preparing to read or consult professionally.', hi: 'पेशेवर रूप से रीडिंग या परामर्श देने की तैयारी कर रहे उन्नत छात्रों के लिए।' },
    modules: [
      { en: 'Client-Ready Reading Practice', hi: 'ग्राहक के लिए तैयार रीडिंग अभ्यास' },
      { en: 'Ethics & Professional Boundaries', hi: 'नैतिकता एवं पेशेवर सीमाएं' },
      { en: 'Practice Building Essentials', hi: 'अभ्यास निर्माण की आवश्यक बातें' },
    ],
  },
  Mastery: {
    learn: [
      { en: 'Refining a personal, confident professional style', hi: 'व्यक्तिगत, आत्मविश्वासपूर्ण पेशेवर शैली को निखारना' },
      { en: 'Working with complex, real client scenarios', hi: 'जटिल, वास्तविक ग्राहक परिस्थितियों पर काम करना' },
      { en: 'Continued growth as a practitioner', hi: 'एक अभ्यासी के रूप में निरंतर विकास' },
    ],
    who: { en: 'Professional-level students seeking mastery and certification.', hi: 'महारत एवं प्रमाणन चाहने वाले पेशेवर स्तर के छात्रों के लिए।' },
    modules: [
      { en: 'Personal Style & Mastery Practice', hi: 'व्यक्तिगत शैली एवं महारत अभ्यास' },
      { en: 'Real Client Case Work', hi: 'वास्तविक ग्राहक केस कार्य' },
      { en: 'Certification Readiness', hi: 'प्रमाणन हेतु तैयारी' },
    ],
  },
}

const rawTarotCourses: RawCourse[] = [
  {
    slug: 'tarot-beginner-course',
    category: 'tarot',
    level: 'Beginner',
    featured: true,
    title: { en: 'Tarot Beginner Course', hi: 'टैरो बिगिनर कोर्स' },
    description: { en: 'Start your Tarot journey with the fundamentals of the deck.', hi: 'डेक की मूल बातों के साथ अपनी टैरो यात्रा शुरू करें।' },
  },
  {
    slug: 'tarot-basic-course',
    category: 'tarot',
    level: 'Basic',
    title: { en: 'Tarot Basic Course', hi: 'टैरो बेसिक कोर्स' },
    description: { en: 'Build a working knowledge of the cards through guided practice.', hi: 'निर्देशित अभ्यास के माध्यम से कार्ड्स की कार्यात्मक समझ बनाएं।' },
  },
  {
    slug: 'tarot-intermediate-course',
    category: 'tarot',
    level: 'Intermediate',
    title: { en: 'Tarot Intermediate Course', hi: 'टैरो इंटरमीडिएट कोर्स' },
    description: { en: 'Deepen your interpretation skills with layered spreads.', hi: 'बहुस्तरीय स्प्रेड के साथ अपनी व्याख्या क्षमता को गहरा करें।' },
  },
  {
    slug: 'tarot-advanced-course',
    category: 'tarot',
    level: 'Advanced',
    title: { en: 'Tarot Advanced Course', hi: 'टैरो एडवांस्ड कोर्स' },
    description: { en: 'Work with complex spreads and nuanced client questions.', hi: 'जटिल स्प्रेड और संवेदनशील ग्राहक प्रश्नों पर काम करें।' },
  },
  {
    slug: 'professional-tarot-reading-course',
    category: 'tarot',
    level: 'Professional',
    featured: true,
    title: { en: 'Professional Tarot Reading Course', hi: 'प्रोफेशनल टैरो रीडिंग कोर्स' },
    description: { en: 'Prepare to deliver structured, client-ready Tarot readings.', hi: 'संरचित, ग्राहक-तैयार टैरो रीडिंग देने की तैयारी करें।' },
  },
  {
    slug: 'tarot-mastery-course',
    category: 'tarot',
    level: 'Mastery',
    title: { en: 'Tarot Mastery Course', hi: 'टैरो मास्टरी कोर्स' },
    description: { en: 'Refine a confident, personal reading style at a professional level.', hi: 'पेशेवर स्तर पर एक आत्मविश्वासपूर्ण, व्यक्तिगत रीडिंग शैली को निखारें।' },
  },
  {
    slug: 'tarot-certification-course',
    category: 'tarot',
    level: 'Mastery',
    title: { en: 'Tarot Certification Course', hi: 'टैरो सर्टिफिकेशन कोर्स' },
    description: { en: 'A capstone path toward Tarot certification where offered.', hi: 'जहां उपलब्ध हो, वहां टैरो प्रमाणन की ओर एक समापन पथ।' },
  },
  {
    slug: 'love-relationship-tarot-course',
    category: 'tarot',
    level: 'Intermediate',
    title: { en: 'Love & Relationship Tarot Course', hi: 'प्रेम एवं संबंध टैरो कोर्स' },
    description: { en: 'Specialize in reading Tarot for love and relationship questions.', hi: 'प्रेम एवं संबंध संबंधी प्रश्नों के लिए टैरो रीडिंग में विशेषज्ञता प्राप्त करें।' },
  },
  {
    slug: 'advanced-tarot-spreads-course',
    category: 'tarot',
    level: 'Advanced',
    title: { en: 'Advanced Tarot Spreads Course', hi: 'एडवांस्ड टैरो स्प्रेड कोर्स' },
    description: { en: 'Learn and apply a wider range of advanced spreads.', hi: 'उन्नत स्प्रेड की व्यापक श्रृंखला सीखें एवं लागू करें।' },
  },
  {
    slug: 'tarot-intuitive-reading-course',
    category: 'tarot',
    level: 'Intermediate',
    title: { en: 'Tarot Intuitive Reading Course', hi: 'टैरो इंट्यूटिव रीडिंग कोर्स' },
    description: { en: 'Balance structured technique with intuitive interpretation.', hi: 'संरचित तकनीक और सहज व्याख्या के बीच संतुलन बनाएं।' },
  },
  {
    slug: 'tarot-remedies-course',
    category: 'tarot',
    level: 'Advanced',
    title: { en: 'Tarot Remedies Course', hi: 'टैरो रेमेडीज़ कोर्स' },
    description: { en: 'Explore card-based guidance practices alongside your readings.', hi: 'अपनी रीडिंग के साथ कार्ड आधारित मार्गदर्शन अभ्यास का अन्वेषण करें।' },
  },
  {
    slug: 'tarot-for-professional-practice',
    category: 'tarot',
    level: 'Professional',
    title: { en: 'Tarot for Professional Practice', hi: 'प्रोफेशनल प्रैक्टिस के लिए टैरो' },
    description: { en: 'Practical guidance on running an honest, sustainable Tarot practice.', hi: 'एक ईमानदार, टिकाऊ टैरो अभ्यास चलाने पर व्यावहारिक मार्गदर्शन।' },
  },
]

const rawAstrologyCourses: RawCourse[] = [
  {
    slug: 'astrology-beginner-course',
    category: 'astrology',
    level: 'Beginner',
    featured: true,
    title: { en: 'Astrology Beginner Course', hi: 'ज्योतिष बिगिनर कोर्स' },
    description: { en: 'Start learning Vedic astrology from the ground up.', hi: 'शुरुआत से वैदिक ज्योतिष सीखना शुरू करें।' },
  },
  {
    slug: 'astrology-basic-course',
    category: 'astrology',
    level: 'Basic',
    title: { en: 'Astrology Basic Course', hi: 'ज्योतिष बेसिक कोर्स' },
    description: { en: 'Build a working understanding of charts and planetary basics.', hi: 'कुंडली एवं ग्रहों की मूल बातों की कार्यात्मक समझ बनाएं।' },
  },
  {
    slug: 'astrology-intermediate-course',
    category: 'astrology',
    level: 'Intermediate',
    title: { en: 'Astrology Intermediate Course', hi: 'ज्योतिष इंटरमीडिएट कोर्स' },
    description: { en: 'Go deeper into houses, aspects and chart interpretation.', hi: 'भाव, दृष्टि और कुंडली व्याख्या में गहराई से जाएं।' },
  },
  {
    slug: 'astrology-advanced-course',
    category: 'astrology',
    level: 'Advanced',
    title: { en: 'Astrology Advanced Course', hi: 'ज्योतिष एडवांस्ड कोर्स' },
    description: { en: 'Work with advanced charting techniques and layered analysis.', hi: 'उन्नत कुंडली तकनीकों एवं बहुस्तरीय विश्लेषण पर काम करें।' },
  },
  {
    slug: 'professional-astrology-course',
    category: 'astrology',
    level: 'Professional',
    featured: true,
    title: { en: 'Professional Astrology Course', hi: 'प्रोफेशनल ज्योतिष कोर्स' },
    description: { en: 'Prepare to deliver structured, client-ready astrology consultations.', hi: 'संरचित, ग्राहक-तैयार ज्योतिष परामर्श देने की तैयारी करें।' },
  },
  {
    slug: 'vedic-astrology-course',
    category: 'astrology',
    level: 'Intermediate',
    title: { en: 'Vedic Astrology Course', hi: 'वैदिक ज्योतिष कोर्स' },
    description: { en: 'A focused course on core Vedic astrology principles.', hi: 'मूल वैदिक ज्योतिष सिद्धांतों पर केंद्रित एक कोर्स।' },
  },
  {
    slug: 'kundli-reading-course',
    category: 'astrology',
    level: 'Basic',
    title: { en: 'Kundli Reading Course', hi: 'कुंडली रीडिंग कोर्स' },
    description: { en: 'Learn to read and explain a birth chart with confidence.', hi: 'आत्मविश्वास के साथ जन्म कुंडली पढ़ना एवं समझाना सीखें।' },
  },
  {
    slug: 'predictive-astrology-course',
    category: 'astrology',
    level: 'Advanced',
    title: { en: 'Predictive Astrology Course', hi: 'प्रेडिक्टिव ज्योतिष कोर्स' },
    description: { en: 'Learn predictive techniques used across dashas and transits.', hi: 'दशाओं एवं गोचर में प्रयुक्त भविष्यसूचक तकनीकें सीखें।' },
  },
  {
    slug: 'advanced-kundli-analysis-course',
    category: 'astrology',
    level: 'Advanced',
    title: { en: 'Advanced Kundli Analysis Course', hi: 'एडवांस्ड कुंडली विश्लेषण कोर्स' },
    description: { en: 'Layered, in-depth chart analysis for complex questions.', hi: 'जटिल प्रश्नों के लिए बहुस्तरीय, गहन कुंडली विश्लेषण।' },
  },
  {
    slug: 'dasha-transit-course',
    category: 'astrology',
    level: 'Intermediate',
    title: { en: 'Dasha & Transit Course', hi: 'दशा एवं गोचर कोर्स' },
    description: { en: 'A focused course on dasha systems and transit analysis.', hi: 'दशा प्रणालियों एवं गोचर विश्लेषण पर केंद्रित एक कोर्स।' },
  },
  {
    slug: 'astrology-remedies-course',
    category: 'astrology',
    level: 'Advanced',
    title: { en: 'Astrology Remedies Course', hi: 'ज्योतिष उपाय कोर्स' },
    description: { en: 'Explore traditional remedial practices alongside chart analysis.', hi: 'कुंडली विश्लेषण के साथ पारंपरिक उपाय अभ्यासों का अन्वेषण करें।' },
  },
  {
    slug: 'professional-astrology-certification-course',
    category: 'astrology',
    level: 'Mastery',
    title: { en: 'Professional Astrology Certification Course', hi: 'प्रोफेशनल ज्योतिष सर्टिफिकेशन कोर्स' },
    description: { en: 'A capstone path toward astrology certification where offered.', hi: 'जहां उपलब्ध हो, वहां ज्योतिष प्रमाणन की ओर एक समापन पथ।' },
  },
]

function buildCourse(raw: RawCourse): Course {
  const content = levelContent[raw.level]
  return {
    ...raw,
    overview: raw.description,
    whatYouLearn: content.learn,
    whoItsFor: content.who,
    modules: content.modules,
  }
}

export const tarotCourses: Course[] = rawTarotCourses.map(buildCourse)
export const astrologyCourses: Course[] = rawAstrologyCourses.map(buildCourse)
export const allCourses: Course[] = [...tarotCourses, ...astrologyCourses]

export const learningLevels: CourseLevel[] = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Professional', 'Mastery']
