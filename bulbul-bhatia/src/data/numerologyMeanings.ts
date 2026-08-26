import { Bilingual } from './types'

export interface NumberMeaning {
  meaning: Bilingual
  strengths: Bilingual
  challenges: Bilingual
  guidance: Bilingual
}

export const numerologyMeanings: Record<number, NumberMeaning> = {
  1: {
    meaning: { en: 'The number of leadership, independence and new beginnings.', hi: 'नेतृत्व, स्वतंत्रता एवं नई शुरुआत का अंक।' },
    strengths: { en: 'Confidence, initiative and originality.', hi: 'आत्मविश्वास, पहल एवं मौलिकता।' },
    challenges: { en: 'Impatience and difficulty sharing control.', hi: 'अधीरता एवं नियंत्रण साझा करने में कठिनाई।' },
    guidance: { en: 'Lead with confidence, but make space for others.', hi: 'आत्मविश्वास के साथ नेतृत्व करें, पर दूसरों के लिए भी जगह बनाएं।' },
  },
  2: {
    meaning: { en: 'The number of partnership, sensitivity and cooperation.', hi: 'साझेदारी, संवेदनशीलता एवं सहयोग का अंक।' },
    strengths: { en: 'Diplomacy, patience and intuition.', hi: 'कूटनीति, धैर्य एवं सहज ज्ञान।' },
    challenges: { en: 'Over-sensitivity and indecision.', hi: 'अति-संवेदनशीलता एवं अनिर्णय।' },
    guidance: { en: 'Trust your instincts about people and timing.', hi: 'लोगों एवं समय के बारे में अपनी सहज बुद्धि पर भरोसा करें।' },
  },
  3: {
    meaning: { en: 'The number of expression, creativity and communication.', hi: 'अभिव्यक्ति, रचनात्मकता एवं संवाद का अंक।' },
    strengths: { en: 'Creativity, optimism and sociability.', hi: 'रचनात्मकता, आशावाद एवं मिलनसारिता।' },
    challenges: { en: 'Scattered focus and over-talking.', hi: 'बिखरा ध्यान एवं अत्यधिक बातूनीपन।' },
    guidance: { en: 'Channel your creative energy into one thing at a time.', hi: 'अपनी रचनात्मक ऊर्जा को एक समय में एक कार्य पर केंद्रित करें।' },
  },
  4: {
    meaning: { en: 'The number of structure, discipline and hard work.', hi: 'संरचना, अनुशासन एवं परिश्रम का अंक।' },
    strengths: { en: 'Reliability, organization and persistence.', hi: 'भरोसेमंदी, संगठन एवं दृढ़ता।' },
    challenges: { en: 'Rigidity and resistance to change.', hi: 'कठोरता एवं बदलाव के प्रति प्रतिरोध।' },
    guidance: { en: 'Build steadily, but stay open to new methods.', hi: 'स्थिरता से निर्माण करें, पर नए तरीकों के लिए खुले रहें।' },
  },
  5: {
    meaning: { en: 'The number of freedom, change and adaptability.', hi: 'स्वतंत्रता, परिवर्तन एवं अनुकूलनशीलता का अंक।' },
    strengths: { en: 'Versatility, curiosity and courage.', hi: 'बहुमुखी प्रतिभा, जिज्ञासा एवं साहस।' },
    challenges: { en: 'Restlessness and inconsistency.', hi: 'बेचैनी एवं अस्थिरता।' },
    guidance: { en: 'Embrace change while honouring your commitments.', hi: 'अपनी प्रतिबद्धताओं का सम्मान करते हुए बदलाव को अपनाएं।' },
  },
  6: {
    meaning: { en: 'The number of responsibility, harmony and care.', hi: 'ज़िम्मेदारी, सामंजस्य एवं देखभाल का अंक।' },
    strengths: { en: 'Compassion, reliability and nurturing.', hi: 'करुणा, भरोसेमंदी एवं देखभाल।' },
    challenges: { en: 'Over-giving and difficulty setting boundaries.', hi: 'अत्यधिक देना एवं सीमाएं तय करने में कठिनाई।' },
    guidance: { en: 'Care for others without losing yourself.', hi: 'स्वयं को खोए बिना दूसरों की देखभाल करें।' },
  },
  7: {
    meaning: { en: 'The number of introspection, wisdom and spirituality.', hi: 'आत्मचिंतन, ज्ञान एवं आध्यात्मिकता का अंक।' },
    strengths: { en: 'Analysis, depth and intuition.', hi: 'विश्लेषण, गहराई एवं सहज ज्ञान।' },
    challenges: { en: 'Isolation and overthinking.', hi: 'अलगाव एवं अति-चिंतन।' },
    guidance: { en: 'Balance solitude with meaningful connection.', hi: 'एकांत को सार्थक जुड़ाव के साथ संतुलित करें।' },
  },
  8: {
    meaning: { en: 'The number of ambition, authority and material achievement.', hi: 'महत्वाकांक्षा, अधिकार एवं भौतिक उपलब्धि का अंक।' },
    strengths: { en: 'Drive, discipline and business sense.', hi: 'प्रेरणा, अनुशासन एवं व्यावसायिक समझ।' },
    challenges: { en: 'Workaholism and controlling tendencies.', hi: 'अत्यधिक काम करना एवं नियंत्रण की प्रवृत्ति।' },
    guidance: { en: 'Pursue success without neglecting wellbeing.', hi: 'स्वास्थ्य की उपेक्षा किए बिना सफलता प्राप्त करें।' },
  },
  9: {
    meaning: { en: 'The number of compassion, completion and idealism.', hi: 'करुणा, पूर्णता एवं आदर्शवाद का अंक।' },
    strengths: { en: 'Generosity, empathy and vision.', hi: 'उदारता, सहानुभूति एवं दूरदर्शिता।' },
    challenges: { en: 'Difficulty letting go and emotional overwhelm.', hi: 'चीज़ों को छोड़ने में कठिनाई एवं भावनात्मक अधिकता।' },
    guidance: { en: 'Give generously, and allow yourself to receive too.', hi: 'उदारता से दें, और स्वयं को पाने की भी अनुमति दें।' },
  },
  11: {
    meaning: { en: 'A master number of intuition, inspiration and insight.', hi: 'सहज ज्ञान, प्रेरणा एवं अंतर्दृष्टि का मास्टर अंक।' },
    strengths: { en: 'Heightened intuition and inspiring presence.', hi: 'प्रबल सहज ज्ञान एवं प्रेरणादायक उपस्थिति।' },
    challenges: { en: 'Nervous energy and self-doubt.', hi: 'बेचैन ऊर्जा एवं आत्म-संदेह।' },
    guidance: { en: 'Ground your intuition with practical steps.', hi: 'अपनी सहज बुद्धि को व्यावहारिक कदमों से सशक्त करें।' },
  },
  22: {
    meaning: { en: 'A master number of large-scale building and vision.', hi: 'बड़े पैमाने पर निर्माण एवं दूरदर्शिता का मास्टर अंक।' },
    strengths: { en: 'Practical vision and the ability to build lasting things.', hi: 'व्यावहारिक दूरदर्शिता एवं स्थायी चीज़ें बनाने की क्षमता।' },
    challenges: { en: 'Pressure and high self-expectation.', hi: 'दबाव एवं स्वयं से अत्यधिक अपेक्षा।' },
    guidance: { en: 'Pace your ambitions realistically.', hi: 'अपनी महत्वाकांक्षाओं को यथार्थवादी गति दें।' },
  },
  33: {
    meaning: { en: 'A master number of compassionate teaching and healing.', hi: 'करुणामय शिक्षण एवं उपचार का मास्टर अंक।' },
    strengths: { en: 'Nurturing wisdom and selfless service.', hi: 'पोषणकारी ज्ञान एवं निःस्वार्थ सेवा।' },
    challenges: { en: 'Self-sacrifice and burnout.', hi: 'आत्म-त्याग एवं थकान।' },
    guidance: { en: 'Serve others while protecting your own energy.', hi: 'अपनी ऊर्जा की रक्षा करते हुए दूसरों की सेवा करें।' },
  },
}

export function meaningFor(n: number): NumberMeaning {
  return numerologyMeanings[n] ?? numerologyMeanings[reduceFallback(n)]
}

function reduceFallback(n: number): number {
  let x = n
  while (x > 9) {
    x = String(x)
      .split('')
      .reduce((s, d) => s + Number(d), 0)
  }
  return x
}
