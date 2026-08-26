import { FAQCategory } from './types'

export const faqs: FAQCategory[] = [
  {
    category: { en: 'Astrology', hi: 'ज्योतिष' },
    items: [
      {
        question: { en: 'What is a Kundli reading?', hi: 'कुंडली रीडिंग क्या है?' },
        answer: {
          en: 'A Kundli reading is an analysis of your Vedic birth chart, prepared using your date, time and place of birth, to understand personality, strengths and key life themes.',
          hi: 'कुंडली रीडिंग आपकी जन्म तिथि, समय एवं स्थान का उपयोग करके तैयार आपकी वैदिक जन्म कुंडली का विश्लेषण है, जो व्यक्तित्व, क्षमताओं एवं जीवन के प्रमुख विषयों को समझने में मदद करता है।',
        },
      },
      {
        question: { en: 'What information is needed?', hi: 'क्या जानकारी आवश्यक है?' },
        answer: {
          en: 'Typically your full name, date of birth, exact time of birth and place of birth. Accurate birth time helps produce a more precise chart.',
          hi: 'सामान्यतः आपका पूरा नाम, जन्म तिथि, सटीक जन्म समय एवं जन्म स्थान आवश्यक होता है। सटीक जन्म समय अधिक सटीक कुंडली बनाने में मदद करता है।',
        },
      },
      {
        question: { en: 'How does an online consultation work?', hi: 'ऑनलाइन परामर्श कैसे काम करता है?' },
        answer: {
          en: 'After booking, you will be contacted to confirm your details and preferred time. The consultation itself takes place over call or video, based on availability.',
          hi: 'बुकिंग के बाद, आपकी जानकारी एवं पसंदीदा समय की पुष्टि के लिए आपसे संपर्क किया जाएगा। परामर्श उपलब्धता के अनुसार कॉल या वीडियो के माध्यम से होता है।',
        },
      },
      {
        question: { en: 'What is Kundli Milan?', hi: 'कुंडली मिलान क्या है?' },
        answer: {
          en: 'Kundli Milan is the process of matching two birth charts, traditionally using the Ashtakoot system, to assess compatibility before marriage.',
          hi: 'कुंडली मिलान विवाह से पहले अनुकूलता जांचने के लिए, पारंपरिक रूप से अष्टकूट प्रणाली का उपयोग करते हुए, दो जन्म कुंडलियों के मिलान की प्रक्रिया है।',
        },
      },
    ],
  },
  {
    category: { en: 'Tarot', hi: 'टैरो' },
    items: [
      {
        question: { en: 'What is Tarot?', hi: 'टैरो क्या है?' },
        answer: {
          en: 'Tarot is a card-based reflective practice used to gain insight and clarity about a situation, question or path ahead.',
          hi: 'टैरो एक कार्ड आधारित चिंतनशील अभ्यास है जिसका उपयोग किसी स्थिति, प्रश्न या आगे के मार्ग पर अंतर्दृष्टि एवं स्पष्टता पाने के लिए किया जाता है।',
        },
      },
      {
        question: { en: 'How does an online reading work?', hi: 'ऑनलाइन रीडिंग कैसे काम करती है?' },
        answer: {
          en: 'You book a reading type, share your question if you have one, and the session takes place over call, video or a written format depending on what is offered.',
          hi: 'आप एक रीडिंग प्रकार बुक करते हैं, अपना प्रश्न साझा करते हैं (यदि कोई हो), और सत्र उपलब्ध विकल्प के अनुसार कॉल, वीडियो या लिखित प्रारूप में होता है।',
        },
      },
      {
        question: { en: 'What questions can I ask?', hi: 'मैं क्या प्रश्न पूछ सकता/सकती हूं?' },
        answer: {
          en: 'Most open, reflective questions about love, career, decisions or general direction work well for a Tarot reading.',
          hi: 'प्रेम, करियर, निर्णय या सामान्य दिशा से जुड़े अधिकांश खुले, चिंतनशील प्रश्न टैरो रीडिंग के लिए उपयुक्त होते हैं।',
        },
      },
      {
        question: { en: 'How should I prepare?', hi: 'मुझे कैसे तैयारी करनी चाहिए?' },
        answer: {
          en: 'Come with an open mind and, if possible, a clear question. There is no other special preparation needed.',
          hi: 'खुले मन से आएं और यदि संभव हो तो एक स्पष्ट प्रश्न लेकर आएं। इसके अलावा किसी विशेष तैयारी की आवश्यकता नहीं है।',
        },
      },
    ],
  },
  {
    category: { en: 'Courses', hi: 'कोर्स' },
    items: [
      {
        question: { en: 'Are courses online?', hi: 'क्या कोर्स ऑनलाइन हैं?' },
        answer: {
          en: 'Yes, all courses are designed to be learned online.',
          hi: 'हां, सभी कोर्स ऑनलाइन सीखने के लिए डिज़ाइन किए गए हैं।',
        },
      },
      {
        question: { en: 'Which course is best for beginners?', hi: 'शुरुआती लोगों के लिए कौन सा कोर्स सबसे अच्छा है?' },
        answer: {
          en: 'The Simple / Basic level of the Tarot or Astrology Course is the recommended starting point if you are new to either practice.',
          hi: 'यदि आप किसी भी अभ्यास में नए हैं, तो टैरो या ज्योतिष कोर्स का सरल / बेसिक स्तर शुरुआत के लिए अनुशंसित है।',
        },
      },
      {
        question: { en: 'Can I progress to the advanced level?', hi: 'क्या मैं एडवांस्ड स्तर तक आगे बढ़ सकता/सकती हूं?' },
        answer: {
          en: 'Yes — each Tarot and Astrology course has two levels, Simple / Basic and Advanced, so you can continue once you complete the basic level.',
          hi: 'हां — प्रत्येक टैरो एवं ज्योतिष कोर्स के दो स्तर हैं, सरल / बेसिक एवं एडवांस्ड, ताकि आप बेसिक स्तर पूरा करने के बाद आगे बढ़ सकें।',
        },
      },
      {
        question: { en: 'How do I enroll?', hi: 'मैं दाखिला कैसे लूं?' },
        answer: {
          en: 'Open the course you are interested in and use the Enroll Now button, or contact us directly for guidance on choosing a course.',
          hi: 'जिस कोर्स में आपकी रुचि है उसे खोलें और "अभी दाखिला लें" बटन का उपयोग करें, या कोर्स चुनने में मार्गदर्शन के लिए सीधे हमसे संपर्क करें।',
        },
      },
    ],
  },
]
